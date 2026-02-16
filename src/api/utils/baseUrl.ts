function isLocalhost(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1')
}

function isRunningOnMobile(): boolean {
  return typeof window !== 'undefined' && !isLocalhost(window.location.origin)
}

/**
 * Базовый URL для API-запросов (axios baseURL).
 * На мобильном устройстве localhost недоступен — возвращаем '' (proxy через origin).
 */
export function getApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL
  const base = env != null && String(env).trim() !== '' ? String(env).trim().replace(/\/$/, '') : ''
  if (!base) return ''
  if (isRunningOnMobile() && isLocalhost(base)) return ''
  return base
}

/**
 * Базовый URL для файлов (uploads/MinIO).
 * На мобильном устройстве всегда возвращает origin (proxy).
 */
export function getUploadsBaseUrl(): string {
  if (isRunningOnMobile()) return window.location.origin

  const env = import.meta.env.VITE_UPLOADS_BASE_URL
  const base = env != null && String(env).trim() !== '' ? String(env).trim().replace(/\/$/, '') : ''
  return base || getOriginBaseUrl()
}

/**
 * Базовый URL через origin. Используется как fallback в dev с proxy.
 */
function getOriginBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL
  const base = env != null && String(env).trim() !== '' ? String(env).trim().replace(/\/$/, '') : ''
  if (!base && typeof window !== 'undefined') return window.location.origin
  if (!base) return ''
  if (isRunningOnMobile() && isLocalhost(base)) return window.location.origin
  return base
}

/**
 * Полный URL к файловому ассету (mind, glb, audio).
 * Обрабатывает случаи с абсолютными URL и localhost на мобильных.
 */
export function getAssetUrl(path: string): string {
  if (!path) return path

  if (path.startsWith('http')) {
    if (isRunningOnMobile() && isLocalhost(path)) {
      const match = path.match(/^https?:\/\/[^/]+(\/.*)?$/)
      const pathname = match?.[1] ?? '/'
      return window.location.origin + (pathname.startsWith('/') ? pathname : '/' + pathname)
    }
    return path
  }

  const base = getUploadsBaseUrl()
  const normalized = path.startsWith('/') ? path : '/' + path
  return base + normalized
}
