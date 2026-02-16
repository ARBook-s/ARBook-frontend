import { ref, onBeforeUnmount } from 'vue'

/**
 * Разблокировка аудио на мобильных браузерах.
 * iOS/Safari требуют пользовательского жеста для запуска Audio.
 */
export function useAudioUnlock(audioElements: () => HTMLAudioElement[]) {
  const showSoundHint = ref(true)
  let handler: (() => void) | null = null

  function attach() {
    const unlock = () => {
      showSoundHint.value = false
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchend', unlock)
      handler = null

      audioElements().forEach((el) => {
        if (el.paused) {
          el.play()
            .then(() => {
              el.pause()
              el.currentTime = 0
            })
            .catch(() => {
              /* Автовоспроизведение недоступно — ожидаем следующий жест */
            })
        }
      })
    }

    handler = unlock
    document.addEventListener('click', unlock)
    document.addEventListener('touchend', unlock)
  }

  function detach() {
    if (handler) {
      document.removeEventListener('click', handler)
      document.removeEventListener('touchend', handler)
      handler = null
    }
  }

  function hideSoundHint() {
    showSoundHint.value = false
  }

  onBeforeUnmount(detach)

  return { showSoundHint, hideSoundHint, attach, detach }
}
