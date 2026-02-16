<template>
  <main v-if="!started && !error" class="start" :class="{ 'start--landscape': isLandscape }" role="main">
    <article class="start__card">
      <img :src="logoUrl" alt="Логотип ARBook — интерактивная AR-книга" class="start__logo" width="80" height="80" />
      <h1 class="start__title">AR-книга</h1>
      <p class="start__subtitle">Наведите камеру на маркер в книге</p>
      <button class="start__btn" @click="start" :disabled="arLoading" aria-label="Запустить камеру для AR">
        Запустить камеру
      </button>
    </article>
    <nav class="start__nav" aria-label="Навигация">
      <router-link to="/admin" class="start__admin">Админ</router-link>
    </nav>
  </main>

  <section v-if="error && !cameraOnlyMode" class="start start--error" role="alert" aria-live="assertive">
    <div class="start__card start__card--error">
      <div class="start__icon start__icon--error" aria-hidden="true">!</div>
      <h2 class="start__title start__title--small">Что-то пошло не так</h2>
      <p class="start__error-text">{{ error }}</p>
      <button
        class="start__btn start__btn--secondary"
        @click="error = ''; started = false"
        aria-label="Попробовать запустить камеру снова"
      >
        Попробовать снова
      </button>
    </div>
  </section>

  <section v-if="arLoading" class="start start--loading" role="status" aria-live="polite">
    <div class="start__card start__card--loading">
      <div class="start__spinner" aria-hidden="true"></div>
      <p class="start__loading-text">Загрузка…</p>
    </div>
  </section>

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
  <PerformanceStatsPanel
    v-if="started"
    :stats="perfStats.stats.value"
    :visible="perfStats.visible.value"
    @toggle="perfStats.toggle"
  />
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { isAxiosError } from 'axios'
import logoUrl from '@/assets/logo.jpg'
import { useArScene } from '@/composables/useArScene'
import { useCameraFallback } from '@/composables/useCameraFallback'
import { useModelRotation } from '@/composables/useModelRotation'
import { useAudioUnlock } from '@/composables/useAudioUnlock'
import { usePerformanceStats } from '@/composables/usePerformanceStats'
import { useOrientation } from '@/composables/useOrientation'
import PerformanceStatsPanel from '@/components/PerformanceStatsPanel.vue'

const container = ref<HTMLDivElement | null>(null)
const started = ref(false)
const error = ref('')

const { loading: arLoading, startArScene, resize: resizeArScene } = useArScene()
const { orientation, isLandscape } = useOrientation()

// При смене ориентации — пересчитать размеры MindAR, рендерера и камеры
watch(orientation, () => {
  if (started.value) {
    resizeArScene()
  }
})
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

/* === Landscape адаптация === */
.start--landscape .start__card {
  padding: 1.5rem 2rem;
  max-width: 28rem;
  flex-direction: row;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem 1.5rem;
}

.start--landscape .start__logo {
  width: 3.5rem;
  height: 3.5rem;
  margin: 0;
}

.start--landscape .start__title {
  font-size: 1.35rem;
  margin: 0;
}

.start--landscape .start__subtitle {
  flex-basis: 100%;
  text-align: center;
  margin: 0;
}

.start--landscape .start__btn {
  flex-basis: 100%;
  padding: 0.65rem 1.25rem;
}

@media (orientation: landscape) {
  .sound-hint {
    bottom: 0.75rem;
  }

  .camera-only-overlay__card {
    max-width: 28rem;
    padding: 1.25rem 1.5rem;
  }
}

/* Safe area для устройств с вырезами (notch) */
@supports (padding: env(safe-area-inset-left)) {
  .start__admin {
    right: max(1.25rem, env(safe-area-inset-right));
    top: max(1.25rem, env(safe-area-inset-top));
  }

  .sound-hint {
    bottom: max(2rem, env(safe-area-inset-bottom));
  }
}
</style>
