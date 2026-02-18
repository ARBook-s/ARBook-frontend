import { ref, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import 'mind-ar-ts/src/image-target/index'
import MindARThree from 'mind-ar-ts/src/image-target/three'
import { getMarkers, getAssetUrl } from '@/api/markers'
import { mergeMindFiles } from '@/utils/mergeMindFiles'
import type { Marker } from '@/api/types'
import {
  BASE_SCALE,
  DEFAULT_VOLUME,
  FILTER_MIN_CF,
  FILTER_BETA,
  MAX_PIXEL_RATIO,
  MAX_PIXEL_RATIO_MOBILE,
  IDLE_FRAME_SKIP,
  TARGET_FPS,
  CAMERA_WIDTH,
  CAMERA_HEIGHT,
} from '@/constants/ar'
import { logger } from '@/utils/logger'

interface ArSceneContext {
  /** Массив для ручного вращения (заполняется useModelRotation) */
  manualRotationY: number[]
  /** Видимые маркеры (для useModelRotation) */
  visibleTargets: Set<number>
  /** Аудиоэлементы (для useAudioUnlock) */
  audioElements: HTMLAudioElement[]
  /** Рендерер Three.js (для статистики) */
  renderer: THREE.WebGLRenderer
}

function cacheBust(url: string): string {
  return url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`
}

function cleanupThreeScene(scene?: THREE.Scene) {
  scene?.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose()
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
      for (const mat of materials) {
        if (mat && typeof mat.dispose === 'function') mat.dispose()
      }
    }
  })
}

/**
 * Инициализация и управление AR-сценой: MindAR + Three.js.
 * Загружает маркеры, модели, аудио, запускает анимацию.
 */
export function useArScene() {
  const loading = ref(false)

  let mindar: MindARThree | undefined
  let renderer: THREE.WebGLRenderer | undefined
  let mixers: THREE.AnimationMixer[] = []
  let audioElements: HTMLAudioElement[] = []
  let combinedMindBlobUrl: string | null = null
  let activeDracoLoader: DRACOLoader | undefined
  const visibleTargets = new Set<number>()

  /**
   * Загружает маркеры с API и запускает AR-сцену.
   * @returns context для подключения composables (rotation, audio) или null если нет маркеров
   */
  async function startArScene(containerEl: HTMLDivElement): Promise<ArSceneContext | null> {
    loading.value = true

    const markers = await getMarkers()
    if (!markers.length) {
      loading.value = false
      return null
    }

    const mindUrls = markers.map((m) => cacheBust(getAssetUrl(m.mindFilePath)))
    combinedMindBlobUrl = await mergeMindFiles(mindUrls)

    mindar = new MindARThree({
      container: containerEl,
      imageTargetSrc: combinedMindBlobUrl,
      maxTrack: markers.length,
      uiLoading: 'no',
      uiScanning: 'no',
      uiError: 'no',
      filterMinCF: FILTER_MIN_CF,
      filterBeta: FILTER_BETA,
    })

    // Патчим _startVideo для ограничения разрешения камеры (640x480)
    const mindarAny = mindar as unknown as Record<string, unknown>
    mindarAny._startVideo = function () {
      return new Promise<void>((resolve, reject) => {
        const video = document.createElement('video')
        video.setAttribute('autoplay', '')
        video.setAttribute('muted', '')
        video.setAttribute('playsinline', '')
        video.style.position = 'absolute'
        video.style.top = '0px'
        video.style.left = '0px'
        video.style.zIndex = '-2'
        ;(mindarAny.container as HTMLDivElement).appendChild(video)

        if (!navigator.mediaDevices?.getUserMedia) {
          reject(new Error('getUserMedia не поддерживается'))
          return
        }

        navigator.mediaDevices
          .getUserMedia({
            audio: false,
            video: {
              facingMode: 'environment',
              width: { ideal: CAMERA_WIDTH },
              height: { ideal: CAMERA_HEIGHT },
            },
          })
          .then((stream) => {
            video.addEventListener('loadedmetadata', () => {
              video.setAttribute('width', video.videoWidth.toString())
              video.setAttribute('height', video.videoHeight.toString())
              resolve()
            })
            video.srcObject = stream
            mindarAny.video = video
          })
          .catch((err) => {
            logger.error('[useArScene] getUserMedia error', err)
            reject(err)
          })
      })
    }

    const scene = (mindar as unknown as { scene: THREE.Scene }).scene
    const camera = (mindar as unknown as { camera: THREE.PerspectiveCamera }).camera
    renderer = (mindar as unknown as { renderer: THREE.WebGLRenderer }).renderer

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    const maxRatio = isMobile ? MAX_PIXEL_RATIO_MOBILE : MAX_PIXEL_RATIO
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxRatio))

    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1))

    activeDracoLoader = new DRACOLoader()
    activeDracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(activeDracoLoader)

    const modelWrappers: THREE.Group[] = []
    const manualRotationY = markers.map(() => 0)

    // Состояние ленивой загрузки моделей
    const modelLoaded: boolean[] = markers.map(() => false)
    const modelLoading: boolean[] = markers.map(() => false)

    for (let i = 0; i < markers.length; i++) {
      const marker = markers[i] as Marker

      const modelWrapper = new THREE.Group()
      modelWrappers.push(modelWrapper)

      const anchor = mindar.addAnchor(i)
      anchor.group.add(modelWrapper)

      // Аудио: preload metadata — полная загрузка только при обнаружении маркера
      const audioEl = new Audio()
      audioEl.src = cacheBust(getAssetUrl(marker.audioPath))
      audioEl.loop = true
      audioEl.volume = DEFAULT_VOLUME
      audioEl.preload = 'metadata'
      audioEl.setAttribute('playsinline', '')
      audioEl.setAttribute('webkit-playsinline', '')
      audioEl.style.display = 'none'
      document.body.appendChild(audioEl)
      audioElements.push(audioEl)

      const anchorObj = anchor as unknown as {
        onTargetFound: () => void
        onTargetLost: () => void
      }

      anchorObj.onTargetFound = () => {
        visibleTargets.add(i)
        audioEl.currentTime = 0
        audioEl.play().catch(() => {
          /* Автовоспроизведение заблокировано — ожидаем жест */
        })

        // Ленивая загрузка модели при первом обнаружении маркера
        if (!modelLoaded[i] && !modelLoading[i]) {
          modelLoading[i] = true
          gltfLoader
            .loadAsync(cacheBust(getAssetUrl(marker.glbModelPath)))
            .then((gltf) => {
              const model = gltf.scene as THREE.Group
              model.scale.setScalar(BASE_SCALE * marker.scale)
              modelWrapper.add(model)

              const mixer = new THREE.AnimationMixer(model)
              mixers.push(mixer)
              for (const clip of gltf.animations) {
                mixer.clipAction(clip as THREE.AnimationClip).play()
              }

              modelLoaded[i] = true
              modelLoading[i] = false
              logger.info(`[useArScene] Модель #${i} загружена по требованию`)
            })
            .catch((err) => {
              modelLoading[i] = false
              logger.error(`[useArScene] Ошибка загрузки модели #${i}:`, err)
            })
        }
      }

      anchorObj.onTargetLost = () => {
        visibleTargets.delete(i)
        audioEl.pause()
      }
    }

    await mindar.start()

    let frameSkip = 0
    let lastTime = performance.now()
    let lastRenderTime = 0
    const frameInterval = 1000 / TARGET_FPS
    const localRenderer = renderer
    localRenderer.setAnimationLoop((time) => {
      const delta = (time - lastTime) / 1000
      lastTime = time

      const sinceLastRender = time - lastRenderTime
      if (sinceLastRender < frameInterval) return

      lastRenderTime = time - (sinceLastRender % frameInterval)

      modelWrappers.forEach((mw, idx) => {
        mw.rotation.y = manualRotationY[idx] ?? 0
      })

      if (visibleTargets.size > 0) {
        mixers.forEach((m) => m.update(delta))
        localRenderer.render(scene, camera)
      } else {
        frameSkip++
        if (frameSkip % IDLE_FRAME_SKIP === 0) {
          localRenderer.render(scene, camera)
        }
      }
    })

    loading.value = false

    return { manualRotationY, visibleTargets, audioElements, renderer: localRenderer }
  }

  function dispose() {
    renderer?.setAnimationLoop(null)

    if (mindar) {
      const scene = (mindar as unknown as { scene?: THREE.Scene }).scene
      mindar.stop()
      cleanupThreeScene(scene)
    }

    renderer?.dispose()
    renderer = undefined

    if (combinedMindBlobUrl) {
      URL.revokeObjectURL(combinedMindBlobUrl)
      combinedMindBlobUrl = null
    }

    audioElements.forEach((el) => {
      el.pause()
      el.remove()
    })
    audioElements = []
    mixers.forEach((m) => m.stopAllAction())
    mixers = []
    visibleTargets.clear()

    if (activeDracoLoader) {
      activeDracoLoader.dispose()
      activeDracoLoader = undefined
    }
  }

  /** Принудительно обновить размеры рендерера и камеры (при смене ориентации) */
  function resize() {
    if (!mindar) return
    const mindarResize = (mindar as unknown as { resize: () => void }).resize
    if (typeof mindarResize === 'function') {
      mindarResize.call(mindar)
    }
  }

  onBeforeUnmount(dispose)

  return { loading, startArScene, dispose, resize }
}
