function isLocalhost(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1')
}

/** Приложение открыто не с localhost (телефон по Wi‑Fi, Tailscale и т.д.) */
function isRemoteClient(): boolean {
  return typeof window !== 'undefined' && !isLocalhost(window.location.hostname)
}

/**
 * Нужен proxy через origin (/api → Vite/nginx → бэкенд).
 * Так бывает при пустом VITE_API_BASE_URL или когда в env указан localhost, а клиент — не ПК.
 */
function shouldUseApiProxy(): boolean {
  const env = import.meta.env.VITE_API_BASE_URL
  const base = env != null ? String(env).trim() : ''
  if (!base) return true
  return isRemoteClient() && isLocalhost(base)
}

/**
 * Базовый URL для API-запросов (axios baseURL).
 * В dev на телефоне — относительный `/api` (прокси Vite на ПК).
 */
export function getApiBaseUrl(): string {
  if (shouldUseApiProxy()) return '/api'

  const env = import.meta.env.VITE_API_BASE_URL
  const base = env != null && String(env).trim() !== '' ? String(env).trim().replace(/\/$/, '') : ''
  return base
}

/** Полный URL к эндпоинту API (для fetch вне axios). */
export function getApiUrl(path: string): string {
  const base = getApiBaseUrl()
  const normalized = path.replace(/^\//, '')
  if (base.startsWith('http')) return `${base}/${normalized}`
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${base}/${normalized}`
  }
  return `${base}/${normalized}`
}

/**
 * Базовый URL для файлов (uploads/MinIO).
 * На мобильном устройстве всегда возвращает origin (proxy).
 */
export function getUploadsBaseUrl(): string {
  const env = import.meta.env.VITE_UPLOADS_BASE_URL
  const base = env != null && String(env).trim() !== '' ? String(env).trim().replace(/\/$/, '') : ''
  if (!base || (isRemoteClient() && isLocalhost(base))) {
    return typeof window !== 'undefined' ? window.location.origin : ''
  }
  return base
}

/**
 * Полный URL к файловому ассету (mind, glb, audio).
 * Обрабатывает случаи с абсолютными URL и localhost на мобильных.
 */
export function getAssetUrl(path: string): string {
  if (!path) return path

  if (path.startsWith('http')) {
    if (isRemoteClient() && isLocalhost(path)) {
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
