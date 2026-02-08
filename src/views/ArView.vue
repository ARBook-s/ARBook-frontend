<template>
  <div v-if="!started && !error" class="start">
    <div class="start__card">
      <img :src="logoUrl" alt="ARBook" class="start__logo" width="80" height="80" />
      <h1 class="start__title">AR-книга</h1>
      <p class="start__subtitle">Наведите камеру на маркер в книге</p>
      <button class="start__btn" @click="start" :disabled="loading">
        Запустить камеру
      </button>
    </div>
    <router-link to="/admin" class="start__admin">Админ</router-link>
  </div>

  <div v-if="error && !cameraOnlyMode" class="start start--error">
    <div class="start__card start__card--error">
      <div class="start__icon start__icon--error" aria-hidden="true">!</div>
      <h2 class="start__title start__title--small">Что-то пошло не так</h2>
      <p class="start__error-text">{{ error }}</p>
      <button class="start__btn start__btn--secondary" @click="error = ''; loading = false">
        Попробовать снова
      </button>
    </div>
  </div>

  <div v-if="loading" class="start start--loading">
    <div class="start__card start__card--loading">
      <div class="start__spinner" aria-hidden="true"></div>
      <p class="start__loading-text">Загрузка…</p>
    </div>
  </div>

  <!-- Камера при проблемах с сетью -->
  <div v-if="cameraOnlyMode" ref="cameraOnlyContainer" class="ar ar--active ar--camera-only">
    <div class="camera-only-overlay">
      <div class="camera-only-overlay__card">
        <p class="camera-only-overlay__text">{{ error }}</p>
        <button class="camera-only-overlay__btn" @click="stopCameraOnly">Попробовать снова</button>
      </div>
    </div>
  </div>
  <div ref="container" class="ar" :class="{ 'ar--active': started }"></div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import logoUrl from '@/assets/logo.jpg'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import 'mind-ar-ts/src/image-target/index'
import MindARThree from 'mind-ar-ts/src/image-target/three'
import { getMarkers, getAssetUrl } from '@/api/markers'
import { isAxiosError } from 'axios'

const container = ref<HTMLDivElement | null>(null)
const started = ref(false)
const loading = ref(false)
const error = ref('')
const cameraOnlyMode = ref(false)

let mindar: MindARThree
let mixer: THREE.AnimationMixer
let fallbackStream: MediaStream | null = null
let fallbackVideo: HTMLVideoElement | null = null
const cameraOnlyContainer = ref<HTMLDivElement | null>(null)

function getErrorMessage(e: unknown): string {
  if (isAxiosError(e) && (e.code === 'ERR_NETWORK' || e.message === 'Network Error')) {
    return 'Сервер недоступен. Запустите API (бэкенд).'
  }
  return e instanceof Error ? e.message : String(e)
}

async function startCameraOnly(message: string) {
  error.value = message
  cameraOnlyMode.value = true
  await nextTick()
  const el = cameraOnlyContainer.value
  if (!el) return
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: 'environment' },
    })
    fallbackStream = stream
    const video = document.createElement('video')
    video.setAttribute('autoplay', '')
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.style.position = 'absolute'
    video.style.inset = '0'
    video.style.width = '100%'
    video.style.height = '100%'
    video.style.objectFit = 'cover'
    video.srcObject = stream
    el.insertBefore(video, el.firstChild)
    fallbackVideo = video
  } catch (e) {
    console.error('Camera error:', e)
    error.value = 'Камера недоступна. ' + (e instanceof Error ? e.message : String(e))
  }
}

function stopCameraOnly() {
  if (fallbackStream) {
    fallbackStream.getTracks().forEach((t) => t.stop())
    fallbackStream = null
  }
  if (fallbackVideo?.parentNode) {
    fallbackVideo.parentNode.removeChild(fallbackVideo)
    fallbackVideo = null
  }
  cameraOnlyMode.value = false
  error.value = ''
  loading.value = false
}

const start = async () => {
  if (!container.value) return
  error.value = ''
  loading.value = true
  started.value = true

  await nextTick()

  try {
    const markers = await getMarkers()
    const marker = markers[0]
    if (!marker) {
      started.value = false
      await startCameraOnly('Нет маркеров')
      return
    }

    const mindUrl = getAssetUrl(marker.mindFilePath)
    const glbUrl = getAssetUrl(marker.glbModelPath)
    const audioUrl = getAssetUrl(marker.audioPath)

    mindar = new MindARThree({
      container: container.value,
      imageTargetSrc: mindUrl,
      maxTrack: 1,
      uiLoading: 'no',
      uiScanning: 'no',
      uiError: 'no',
    })

    const scene = (mindar as unknown as { scene: THREE.Scene }).scene
    const camera = (mindar as unknown as { camera: THREE.PerspectiveCamera }).camera
    const renderer = (mindar as unknown as { renderer: THREE.WebGLRenderer }).renderer

    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1))

    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync(glbUrl)

    const model = gltf.scene as THREE.Group
    model.scale.setScalar(marker.scale)

    const anchor = mindar.addAnchor(0)
    anchor.group.add(model)

    mixer = new THREE.AnimationMixer(model)
    for (const clip of gltf.animations) {
      mixer.clipAction(clip as THREE.AnimationClip).play()
    }

    const listener = new THREE.AudioListener()
    camera.add(listener)
    const sound = new THREE.Audio(listener)

    new THREE.AudioLoader().load(audioUrl, (buffer) => {
      sound.setBuffer(buffer)
      sound.setLoop(true)
      sound.setVolume(0.7)
    })

    const anchorObj = anchor as unknown as { onTargetFound: () => void; onTargetLost: () => void }
    anchorObj.onTargetFound = () => {
      sound.play()
    }
    anchorObj.onTargetLost = () => {
      sound.pause()
    }

    await mindar.start()

    renderer.setAnimationLoop(() => {
      mixer.update(0.016)
      renderer.render(scene, camera)
    })
  } catch (e) {
    console.error('AR start error:', e)
    started.value = false
    await startCameraOnly(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ar {
  position: fixed;
  inset: 0;
  pointer-events: none;
}
.ar--active {
  pointer-events: auto;
}

/* Тёплая палитра: крем, тёмный теал, мягкие тени */
.start {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #f8f4ee 0%, #ebe6dc 100%);
  color: #2c3539;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  padding: 1.5rem;
  box-sizing: border-box;
}

.start__card {
  background: #fff;
  border-radius: 1.25rem;
  padding: 2.5rem 2rem;
  max-width: 20rem;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(44, 53, 57, 0.08), 0 2px 8px rgba(44, 53, 57, 0.04);
}

.start__logo {
  display: block;
  margin: 0 auto 1.25rem;
  width: 5rem;
  height: 5rem;
  object-fit: contain;
}

.start__title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #1a2226;
  letter-spacing: -0.02em;
}

.start__title--small {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.start__subtitle {
  font-size: 0.95rem;
  color: #5c6b73;
  margin: 0 0 1.75rem;
  line-height: 1.4;
}

.start__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.9rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(180deg, #0d5c63 0%, #08464c 100%);
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 4px 14px rgba(13, 92, 99, 0.35);
}

.start__btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(13, 92, 99, 0.4);
}

.start__btn:active:not(:disabled) {
  transform: translateY(0);
}

.start__btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.start__btn--secondary {
  background: linear-gradient(180deg, #e8e4de 0%, #ddd9d2 100%);
  color: #2c3539;
  box-shadow: 0 2px 8px rgba(44, 53, 57, 0.08);
}

.start__btn--secondary:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(44, 53, 57, 0.12);
}

.start__admin {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  color: #7d8a90;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.15s ease;
}

.start__admin:hover {
  color: #0d5c63;
}

/* Ошибка */
.start__card--error {
  border: 1px solid rgba(196, 92, 58, 0.2);
}

.start__icon {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
}

.start__icon--error {
  background: #fef0eb;
  color: #c45c3a;
}

.start__error-text {
  font-size: 0.95rem;
  color: #5c6b73;
  max-width: 100%;
  margin: 0 0 1.5rem;
  line-height: 1.5;
}

/* Загрузка */
.start__card--loading {
  padding: 2rem;
}

.start__spinner {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0 auto 1rem;
  border: 3px solid #e8e4de;
  border-top-color: #0d5c63;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.start__loading-text {
  margin: 0;
  font-size: 0.95rem;
  color: #5c6b73;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Режим «только камера» — светлый оверлей */
.ar--camera-only {
  pointer-events: auto;
}

.camera-only-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 1;
  background: rgba(248, 244, 238, 0.85);
}

.camera-only-overlay__card {
  background: #fff;
  border-radius: 1.25rem;
  padding: 1.75rem 1.5rem;
  max-width: 20rem;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(44, 53, 57, 0.12);
}

.camera-only-overlay__text {
  text-align: center;
  color: #5c6b73;
  margin: 0 0 1.25rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.camera-only-overlay__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(180deg, #0d5c63 0%, #08464c 100%);
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 4px 14px rgba(13, 92, 99, 0.35);
}

.camera-only-overlay__btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(13, 92, 99, 0.4);
}
</style>
