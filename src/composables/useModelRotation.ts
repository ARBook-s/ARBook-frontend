import { onBeforeUnmount } from 'vue'
import { ROTATION_SENSITIVITY } from '@/constants/ar'

/**
 * Обработка touch/mouse для ручного вращения 3D-модели по оси Y.
 * Работает с первым видимым маркером.
 */
export function useModelRotation(getVisibleTargets: () => Set<number>) {
  const manualRotationY: number[] = []
  let lastX = 0

  type AnyListener = { type: string; handler: EventListener; el: HTMLElement }
  const listeners: AnyListener[] = []

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) lastX = e.touches[0]!.clientX
  }

  function handleTouchMove(e: TouchEvent) {
    const visible = getVisibleTargets()
    if (e.touches.length === 1 && visible.size > 0) {
      const t = e.touches[0]!
      const dx = t.clientX - lastX
      const idx = Array.from(visible)[0] ?? 0
      manualRotationY[idx] = (manualRotationY[idx] ?? 0) + dx * ROTATION_SENSITIVITY
      lastX = t.clientX
    }
  }

  function handleMouseDown(e: MouseEvent) {
    if (e.button === 0) lastX = e.clientX
  }

  function handleMouseMove(e: MouseEvent) {
    const visible = getVisibleTargets()
    if (e.buttons === 1 && visible.size > 0) {
      const dx = e.clientX - lastX
      const idx = Array.from(visible)[0] ?? 0
      manualRotationY[idx] = (manualRotationY[idx] ?? 0) + dx * ROTATION_SENSITIVITY
      lastX = e.clientX
    }
  }

  function attach(el: HTMLElement) {
    const add = (type: string, handler: EventListener, opts?: AddEventListenerOptions) => {
      el.addEventListener(type, handler, opts)
      listeners.push({ type, handler, el })
    }
    add('touchstart', handleTouchStart as EventListener, { passive: true })
    add('touchmove', handleTouchMove as EventListener, { passive: true })
    add('mousedown', handleMouseDown as EventListener)
    add('mousemove', handleMouseMove as EventListener)
  }

  function detach() {
    for (const { type, handler, el } of listeners) {
      el.removeEventListener(type, handler)
    }
    listeners.length = 0
  }

  /** Инициализировать массив вращений для N маркеров */
  function init(count: number) {
    manualRotationY.length = 0
    for (let i = 0; i < count; i++) manualRotationY.push(0)
  }

  onBeforeUnmount(detach)

  return { manualRotationY, attach, detach, init }
}
