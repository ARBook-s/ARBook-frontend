import { ref, onBeforeUnmount } from 'vue'
import type * as THREE from 'three'

export interface PerformanceData {
  fps: number
  frameTime: number
  memory: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  } | null
  gpu: string
  pixelRatio: number
  screenSize: string
  canvasSize: string
  visibleTargets: number
  totalMarkers: number
  drawCalls: number
  triangles: number
  textures: number
  geometries: number
}

/**
 * Собирает и обновляет статистику производительности в реальном времени.
 * Обновляется каждые ~500мс для минимальной нагрузки.
 */
export function usePerformanceStats() {
  const stats = ref<PerformanceData>({
    fps: 0,
    frameTime: 0,
    memory: null,
    gpu: '',
    pixelRatio: window.devicePixelRatio,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    canvasSize: '',
    visibleTargets: 0,
    totalMarkers: 0,
    drawCalls: 0,
    triangles: 0,
    textures: 0,
    geometries: 0,
  })

  const visible = ref(false)

  let frames = 0
  let lastFpsUpdate = performance.now()
  let animId: number | null = null
  let rendererRef: THREE.WebGLRenderer | null = null
  let visibleTargetsRef: Set<number> | null = null
  let totalMarkersCount = 0

  function detectGPU(): string {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info')
        if (ext) {
          return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string
        }
        return gl.getParameter(gl.RENDERER) as string
      }
    } catch {
      /* GPU detection not available */
    }
    return 'N/A'
  }

  function getMemory(): PerformanceData['memory'] {
    const perf = performance as unknown as {
      memory?: {
        usedJSHeapSize: number
        totalJSHeapSize: number
        jsHeapSizeLimit: number
      }
    }
    if (perf.memory) {
      return {
        usedJSHeapSize: perf.memory.usedJSHeapSize,
        totalJSHeapSize: perf.memory.totalJSHeapSize,
        jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
      }
    }
    return null
  }

  function tick() {
    const now = performance.now()
    frames++

    const elapsed = now - lastFpsUpdate
    if (elapsed >= 500) {
      const fps = Math.round((frames * 1000) / elapsed)
      const frameTime = +(elapsed / frames).toFixed(1)

      const rendererInfo = rendererRef?.info
      const canvasEl = rendererRef?.domElement

      stats.value = {
        fps,
        frameTime,
        memory: getMemory(),
        gpu: stats.value.gpu,
        pixelRatio: window.devicePixelRatio,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        canvasSize: canvasEl
          ? `${canvasEl.width}x${canvasEl.height}`
          : '',
        visibleTargets: visibleTargetsRef?.size ?? 0,
        totalMarkers: totalMarkersCount,
        drawCalls: rendererInfo?.render?.calls ?? 0,
        triangles: rendererInfo?.render?.triangles ?? 0,
        textures: rendererInfo?.memory?.textures ?? 0,
        geometries: rendererInfo?.memory?.geometries ?? 0,
      }

      frames = 0
      lastFpsUpdate = now
    }

    animId = requestAnimationFrame(tick)
  }

  function start(
    renderer: unknown,
    visibleTargets: Set<number>,
    totalMarkers: number,
  ) {
    rendererRef = renderer as THREE.WebGLRenderer
    visibleTargetsRef = visibleTargets
    totalMarkersCount = totalMarkers
    stats.value.gpu = detectGPU()

    if (!animId) {
      lastFpsUpdate = performance.now()
      frames = 0
      tick()
    }
  }

  function stop() {
    if (animId !== null) {
      cancelAnimationFrame(animId)
      animId = null
    }
  }

  function toggle() {
    visible.value = !visible.value
  }

  onBeforeUnmount(stop)

  return { stats, visible, toggle, start, stop }
}
