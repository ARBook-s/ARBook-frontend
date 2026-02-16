import { ref, readonly, onBeforeUnmount } from 'vue'

export type Orientation = 'portrait' | 'landscape'

/**
 * Отслеживает ориентацию устройства в реальном времени.
 * Реагирует на orientationchange, resize и screen.orientation API.
 * Возвращает реактивные isPortrait / isLandscape / orientation / angle.
 */
export function useOrientation() {
  function detectOrientation(): Orientation {
    // screen.orientation API (наиболее надёжный на мобильных)
    if (screen.orientation?.type) {
      return screen.orientation.type.startsWith('portrait') ? 'portrait' : 'landscape'
    }
    // Fallback: сравниваем размеры окна
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  }

  function getAngle(): number {
    return screen.orientation?.angle ?? 0
  }

  const orientation = ref<Orientation>(detectOrientation())
  const angle = ref(getAngle())
  const isPortrait = ref(orientation.value === 'portrait')
  const isLandscape = ref(orientation.value === 'landscape')

  const listeners: Array<() => void> = []

  function update() {
    const newOrientation = detectOrientation()
    const newAngle = getAngle()

    if (newOrientation !== orientation.value || newAngle !== angle.value) {
      orientation.value = newOrientation
      angle.value = newAngle
      isPortrait.value = newOrientation === 'portrait'
      isLandscape.value = newOrientation === 'landscape'
    }
  }

  // На некоторых устройствах orientationchange срабатывает до обновления размеров,
  // поэтому проверяем с небольшой задержкой
  function handleOrientationChange() {
    update()
    setTimeout(update, 100)
    setTimeout(update, 300)
  }

  // screen.orientation.change — самый надёжный API
  if (screen.orientation) {
    screen.orientation.addEventListener('change', handleOrientationChange)
    listeners.push(() => screen.orientation.removeEventListener('change', handleOrientationChange))
  }

  // Fallback для старых браузеров
  window.addEventListener('orientationchange', handleOrientationChange)
  listeners.push(() => window.removeEventListener('orientationchange', handleOrientationChange))

  // resize — ловит и ориентацию, и изменение окна
  window.addEventListener('resize', update)
  listeners.push(() => window.removeEventListener('resize', update))

  onBeforeUnmount(() => {
    listeners.forEach((off) => off())
  })

  return {
    orientation: readonly(orientation),
    angle: readonly(angle),
    isPortrait: readonly(isPortrait),
    isLandscape: readonly(isLandscape),
  }
}
