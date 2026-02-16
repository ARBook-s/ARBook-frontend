<template>
  <button class="stats-toggle" @click="toggle">
    {{ visible ? '\u2715' : 'STATS' }}
  </button>
  <div v-if="visible" class="stats-overlay">
    <div class="stats-row stats-row--highlight">
      <span>FPS</span>
      <span :class="fpsClass">{{ stats.fps }}</span>
    </div>
    <div class="stats-row">
      <span>Frame</span>
      <span>{{ stats.frameTime }} ms</span>
    </div>
    <div class="stats-divider"></div>
    <div class="stats-row">
      <span>GPU</span>
      <span class="stats-gpu">{{ gpuShort }}</span>
    </div>
    <div class="stats-row">
      <span>Pixel Ratio</span>
      <span>{{ stats.pixelRatio.toFixed(1) }}</span>
    </div>
    <div class="stats-row">
      <span>Screen</span>
      <span>{{ stats.screenSize }}</span>
    </div>
    <div class="stats-row">
      <span>Canvas</span>
      <span>{{ stats.canvasSize }}</span>
    </div>
    <div class="stats-divider"></div>
    <div class="stats-row">
      <span>Markers</span>
      <span>{{ stats.visibleTargets }} / {{ stats.totalMarkers }}</span>
    </div>
    <div class="stats-row">
      <span>Draw Calls</span>
      <span>{{ stats.drawCalls }}</span>
    </div>
    <div class="stats-row">
      <span>Triangles</span>
      <span>{{ formatNumber(stats.triangles) }}</span>
    </div>
    <div class="stats-row">
      <span>Textures</span>
      <span>{{ stats.textures }}</span>
    </div>
    <div class="stats-row">
      <span>Geometries</span>
      <span>{{ stats.geometries }}</span>
    </div>
    <template v-if="stats.memory">
      <div class="stats-divider"></div>
      <div class="stats-row">
        <span>JS Heap</span>
        <span>{{ formatMB(stats.memory.usedJSHeapSize) }} / {{ formatMB(stats.memory.totalJSHeapSize) }}</span>
      </div>
      <div class="stats-row">
        <span>Heap Limit</span>
        <span>{{ formatMB(stats.memory.jsHeapSizeLimit) }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PerformanceData } from '@/composables/usePerformanceStats'

const props = defineProps<{
  stats: PerformanceData
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

function toggle() {
  emit('toggle')
}

const fpsClass = computed(() => {
  const fps = props.stats.fps
  if (fps >= 50) return 'stats-val--good'
  if (fps >= 25) return 'stats-val--warn'
  return 'stats-val--bad'
})

const gpuShort = computed(() => {
  const gpu = props.stats.gpu
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
</script>

<style scoped>
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

@media (orientation: landscape) {
  .stats-overlay {
    top: 2rem;
    max-height: calc(100vh - 3rem);
    overflow-y: auto;
  }
}

@supports (padding: env(safe-area-inset-left)) {
  .stats-toggle {
    left: max(0.5rem, env(safe-area-inset-left));
    top: max(0.5rem, env(safe-area-inset-top));
  }

  .stats-overlay {
    left: max(0.5rem, env(safe-area-inset-left));
    top: max(2.2rem, calc(env(safe-area-inset-top) + 1.5rem));
  }
}
</style>
