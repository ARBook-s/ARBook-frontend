import { ref, watch, nextTick } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { getAssetUrl } from '@/api/markers'
import { message } from 'ant-design-vue'
import type { Marker } from '@/api/types'
import { BASE_SCALE, PREVIEW_FOV, MAX_PIXEL_RATIO, PREVIEW_INIT_DELAY } from '@/constants/ar'

/**
 * Превью 3D-модели в модалке админки.
 * Управляет Three.js сценой с OrbitControls.
 */
export function useModelPreview() {
  const previewModalVisible = ref(false)
  const previewingMarker = ref<Marker | null>(null)
  const previewCanvasRef = ref<HTMLDivElement | null>(null)

  let previewRenderer: THREE.WebGLRenderer | null = null
  let previewControls: InstanceType<typeof OrbitControls> | null = null
  let previewAnimationId: number | null = null

  function openPreviewModal(record: Marker) {
    previewingMarker.value = record
    previewModalVisible.value = true
  }

  async function initPreview() {
    const marker = previewingMarker.value
    const container = previewCanvasRef.value
    if (!marker?.glbModelPath || !container) return

    const { width, height } = container.getBoundingClientRect()
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f2f5)
    const camera = new THREE.PerspectiveCamera(PREVIEW_FOV, width / height, 0.1, 100)
    camera.position.set(2, 2, 2)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO))
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    scene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 1))
    scene.add(new THREE.DirectionalLight(0xffffff, 0.5))

    try {
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
      const loader = new GLTFLoader()
      loader.setDRACOLoader(dracoLoader)
      const baseUrl = getAssetUrl(marker.glbModelPath)
      const glbUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`
      const gltf = await loader.loadAsync(glbUrl)
      const model = gltf.scene as THREE.Group
      model.scale.setScalar(BASE_SCALE * (marker.scale ?? 1))
      scene.add(model)
      dracoLoader.dispose()
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Ошибка загрузки 3D-модели')
    }

    const animate = () => {
      previewAnimationId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    previewRenderer = renderer
    previewControls = controls
  }

  function disposePreview() {
    if (previewAnimationId !== null) {
      cancelAnimationFrame(previewAnimationId)
      previewAnimationId = null
    }
    previewControls?.dispose()
    previewControls = null
    if (previewRenderer) {
      previewRenderer.domElement.parentNode?.removeChild(previewRenderer.domElement)
      previewRenderer.dispose()
      previewRenderer = null
    }
    previewingMarker.value = null
  }

  watch(previewModalVisible, async (visible) => {
    if (visible) {
      await nextTick()
      setTimeout(initPreview, PREVIEW_INIT_DELAY)
    } else {
      disposePreview()
    }
  })

  return {
    previewModalVisible,
    previewingMarker,
    previewCanvasRef,
    openPreviewModal,
  }
}
