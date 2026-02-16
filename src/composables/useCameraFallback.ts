import { ref, nextTick, onBeforeUnmount } from 'vue'

/**
 * Fallback-камера при проблемах с сетью или AR.
 * Показывает видео с задней камеры поверх overlay с ошибкой.
 */
export function useCameraFallback() {
  const cameraOnlyMode = ref(false)
  const cameraOnlyContainer = ref<HTMLDivElement | null>(null)
  const errorMessage = ref('')

  let fallbackStream: MediaStream | null = null
  let fallbackVideo: HTMLVideoElement | null = null

  async function startCameraOnly(message: string) {
    errorMessage.value = message
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
      video.className = 'camera-fallback-video'
      video.srcObject = stream
      el.insertBefore(video, el.firstChild)
      fallbackVideo = video
    } catch (e) {
      errorMessage.value = 'Камера недоступна. ' + (e instanceof Error ? e.message : String(e))
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
    errorMessage.value = ''
  }

  onBeforeUnmount(() => {
    if (fallbackStream) {
      fallbackStream.getTracks().forEach((t) => t.stop())
      fallbackStream = null
    }
    if (fallbackVideo?.parentNode) {
      fallbackVideo.parentNode.removeChild(fallbackVideo)
      fallbackVideo = null
    }
  })

  return {
    cameraOnlyMode,
    cameraOnlyContainer,
    errorMessage,
    startCameraOnly,
    stopCameraOnly,
  }
}
