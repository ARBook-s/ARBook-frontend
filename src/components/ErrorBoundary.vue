<template>
  <slot v-if="!error" />
  <section v-else class="error-boundary" role="alert" aria-live="assertive">
    <div class="error-boundary__card">
      <div class="error-boundary__icon" aria-hidden="true">!</div>
      <h2 class="error-boundary__title">Произошла ошибка</h2>
      <p class="error-boundary__text">{{ error.message || 'Неизвестная ошибка' }}</p>
      <button class="error-boundary__btn" @click="reset" aria-label="Попробовать снова">
        Попробовать снова
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { logger } from '@/utils/logger'

const error = ref<Error | null>(null)

onErrorCaptured((err: Error) => {
  logger.error('[ErrorBoundary]', err)
  error.value = err
  return false
})

function reset() {
  error.value = null
}
</script>

<style scoped>
.error-boundary {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #f8f4ee 0%, #ebe6dc 100%);
  padding: 1.5rem;
  box-sizing: border-box;
  z-index: 50;
}

.error-boundary__card {
  background: #fff;
  border-radius: 1.25rem;
  padding: 2.5rem 2rem;
  max-width: 20rem;
  width: 100%;
  text-align: center;
  box-shadow:
    0 8px 32px rgba(44, 53, 57, 0.08),
    0 2px 8px rgba(44, 53, 57, 0.04);
  border: 1px solid rgba(196, 92, 58, 0.2);
}

.error-boundary__icon {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  background: #fef0eb;
  color: #c45c3a;
}

.error-boundary__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  color: #1a2226;
}

.error-boundary__text {
  font-size: 0.95rem;
  color: #5c6b73;
  margin: 0 0 1.5rem;
  line-height: 1.5;
  word-break: break-word;
}

.error-boundary__btn {
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

.error-boundary__btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(13, 92, 99, 0.4);
}

.error-boundary__btn:active {
  transform: translateY(0);
}
</style>
