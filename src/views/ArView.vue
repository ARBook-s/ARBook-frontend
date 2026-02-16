<template>
  <div v-if="!started && !error" class="start">
    <div class="start__card">
      <img :src="logoUrl" alt="ARBook" class="start__logo" width="80" height="80" />
      <h1 class="start__title">AR-книга</h1>
      <p class="start__subtitle">Наведите камеру на маркер в книге</p>
      <button class="start__btn" @click="start" :disabled="arLoading">
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
      <button
        class="start__btn start__btn--secondary"
        @click="error = ''; started = false"
      >
        Попробовать снова
      </button>
    </div>
  </div>

  <div v-if="arLoading" class="start start--loading">
    <div class="start__card start__card--loading">
      <div class="start__spinner" aria-hidden="true"></div>
      <p class="start__loading-text">Загрузка…</p>
    </div>
  </div>

  <!-- Камера при проблемах с сетью -->
  <div
    v-if="cameraOnlyMode"
    ref="cameraOnlyContainer"
    class="ar ar--active ar--camera-only"
  >
    <div class="camera-only-overlay">
      <div class="camera-only-overlay__card">
        <p class="camera-only-overlay__text">{{ cameraErrorMessage }}</p>
        <button class="camera-only-overlay__btn" @click="handleStopCameraOnly">
          Попробовать снова
        </button>
      </div>
    </div>
  </div>

  <div ref="container" class="ar" :class="{ 'ar--active': started }"></div>

  <div v-if="started && showSoundHint" class="sound-hint" @click="hideSoundHint">
    Нажмите для включения звука
  </div>

  <!-- Performance stats overlay -->
  <button v-if="started" class="stats-toggle" @click="perfStats.toggle">
    {{ perfStats.visible.value ? '✕' : 'STATS' }}
  </button>
  <div v-if="started && perfStats.visible.value" class="stats-overlay">
    <div class="stats-row stats-row--highlight">
      <span>FPS</span>
      <span :class="fpsClass">{{ perfStats.stats.value.fps }}</span>
    </div>
    <div class="stats-row">
      <span>Frame</span>
      <span>{{ perfStats.stats.value.frameTime }} ms</span>
    </div>
    <div class="stats-divider"></div>
    <div class="stats-row">
      <span>GPU</span>
      <span class="stats-gpu">{{ gpuShort }}</span>
    </div>
    <div class="stats-row">
      <span>Pixel Ratio</span>
      <span>{{ perfStats.stats.value.pixelRatio.toFixed(1) }}</span>
    </div>
    <div class="stats-row">
      <span>Screen</span>
      <span>{{ perfStats.stats.value.screenSize }}</span>
    </div>
    <div class="stats-row">
      <span>Canvas</span>
      <span>{{ perfStats.stats.value.canvasSize }}</span>
    </div>
    <div class="stats-divider"></div>
    <div class="stats-row">
      <span>Markers</span>
      <span>{{ perfStats.stats.value.visibleTargets }} / {{ perfStats.stats.value.totalMarkers }}</span>
    </div>
    <div class="stats-row">
      <span>Draw Calls</span>
      <span>{{ perfStats.stats.value.drawCalls }}</span>
    </div>
    <div class="stats-row">
      <span>Triangles</span>
      <span>{{ formatNumber(perfStats.stats.value.triangles) }}</span>
    </div>
    <div class="stats-row">
      <span>Textures</span>
      <span>{{ perfStats.stats.value.textures }}</span>
    </div>
    <div class="stats-row">
      <span>Geometries</span>
      <span>{{ perfStats.stats.value.geometries }}</span>
    </div>
    <template v-if="perfStats.stats.value.memory">
      <div class="stats-divider"></div>
      <div class="stats-row">
        <span>JS Heap</span>
        <span>{{ formatMB(perfStats.stats.value.memory.usedJSHeapSize) }} / {{ formatMB(perfStats.stats.value.memory.totalJSHeapSize) }}</span>
      </div>
      <div class="stats-row">
        <span>Heap Limit</span>
        <span>{{ formatMB(perfStats.stats.value.memory.jsHeapSizeLimit) }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { isAxiosError } from 'axios'
import logoUrl from '@/assets/logo.jpg'
import { useArScene } from '@/composables/useArScene'
import { useCameraFallback } from '@/composables/useCameraFallback'
import { useModelRotation } from '@/composables/useModelRotation'
import { useAudioUnlock } from '@/composables/useAudioUnlock'
import { usePerformanceStats } from '@/composables/usePerformanceStats'

const container = ref<HTMLDivElement | null>(null)
const started = ref(false)
const error = ref('')

const { loading: arLoading, startArScene } = useArScene()
const {
  cameraOnlyMode,
  cameraOnlyContainer,
  errorMessage: cameraErrorMessage,
  startCameraOnly,
  stopCameraOnly,
} = useCameraFallback()

void cameraOnlyContainer

let sceneAudioElements: HTMLAudioElement[] = []
const { showSoundHint, hideSoundHint, attach: attachAudioUnlock } = useAudioUnlock(
  () => sceneAudioElements,
)

let sceneVisibleTargets = new Set<number>()
const { manualRotationY, attach: attachRotation, init: initRotation } = useModelRotation(
  () => sceneVisibleTargets,
)

const perfStats = usePerformanceStats()

const fpsClass = computed(() => {
  const fps = perfStats.stats.value.fps
  if (fps >= 50) return 'stats-val--good'
  if (fps >= 25) return 'stats-val--warn'
  return 'stats-val--bad'
})

const gpuShort = computed(() => {
  const gpu = perfStats.stats.value.gpu
  if (!gpu || gpu === 'N/A') return 'N/A'
  return gpu.length > 30 ? gpu.slice(0, 28) + '...' : gpu
})

function formatMB(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function getErrorMessage(e: unknown): string {
  if (isAxiosError(e) && (e.code === 'ERR_NETWORK' || e.message === 'Network Error')) {
    return 'Сервер недоступен. Запустите API (бэкенд).'
  }
  return e instanceof Error ? e.message : String(e)
}

function handleStopCameraOnly() {
  stopCameraOnly()
  error.value = ''
  started.value = false
}

const start = async () => {
  if (!container.value) return
  error.value = ''
  started.value = true

  await nextTick()

  try {
    const ctx = await startArScene(container.value)

    if (!ctx) {
      started.value = false
      await startCameraOnly('Нет маркеров')
      return
    }

    sceneAudioElements = ctx.audioElements
    sceneVisibleTargets = ctx.visibleTargets

    initRotation(ctx.manualRotationY.length)
    for (let i = 0; i < ctx.manualRotationY.length; i++) {
      Object.defineProperty(ctx.manualRotationY, i, {
        get: () => manualRotationY[i] ?? 0,
        set: (v: number) => {
          manualRotationY[i] = v
        },
      })
    }

    attachRotation(container.value)
    attachAudioUnlock()
    perfStats.start(ctx.renderer, ctx.visibleTargets, ctx.manualRotationY.length)
  } catch (e) {
    started.value = false
    await startCameraOnly(getErrorMessage(e))
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

.start {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #f8f4ee 0%, #ebe6dc 100%);
  color: #2c3539;
  font-family:
    'Segoe UI',
    system-ui,
    -apple-system,
    sans-serif;
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
  box-shadow:
    0 8px 32px rgba(44, 53, 57, 0.08),
    0 2px 8px rgba(44, 53, 57, 0.04);
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
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
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
  to {
    transform: rotate(360deg);
  }
}

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
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  box-shadow: 0 4px 14px rgba(13, 92, 99, 0.35);
}

.camera-only-overlay__btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(13, 92, 99, 0.4);
}

.sound-hint {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.6rem 1.2rem;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 0.85rem;
  border-radius: 2rem;
  z-index: 10;
  pointer-events: auto;
  cursor: pointer;
}

:deep(.camera-fallback-video) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Performance stats */
.stats-toggle {
  position: fixed;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 100;
  padding: 0.3rem 0.6rem;
  font-size: 0.65rem;
  font-weight: 700;
  font-family: monospace;
  color: #0f0;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 4px;
  cursor: pointer;
  line-height: 1;
}

.stats-overlay {
  position: fixed;
  top: 2.2rem;
  left: 0.5rem;
  z-index: 100;
  min-width: 180px;
  padding: 0.5rem 0.6rem;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  font-size: 0.65rem;
  line-height: 1.5;
  color: #ccc;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  backdrop-filter: blur(4px);
  pointer-events: none;
  user-select: none;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.stats-row--highlight {
  font-size: 0.8rem;
  font-weight: 700;
}

.stats-row span:first-child {
  color: #888;
}

.stats-row span:last-child {
  color: #eee;
  text-align: right;
}

.stats-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.25rem 0;
}

.stats-gpu {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-val--good { color: #4f4 !important; }
.stats-val--warn { color: #fc0 !important; }
.stats-val--bad { color: #f44 !important; }
</style>
