import MarkersService from './services/markersService'
import type { Marker } from '@/api/types'

/** Базовый URL бэкенда. В dev с proxy — тот же origin. */
function getBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL
  let base = env != null && String(env).trim() !== '' ? String(env).trim().replace(/\/$/, '') : ''
  if (!base && typeof window !== 'undefined') return window.location.origin
  if (!base) return ''
  // На телефоне localhost недоступен
  if (typeof window !== 'undefined') {
    const isLocalhost = (url: string) =>
      url.includes('localhost') || url.includes('127.0.0.1')
    if (isLocalhost(base) && !isLocalhost(window.location.origin)) {
      return window.location.origin
    }
  }
  return base
}

/** Базовый URL для файлов (uploads). Path-style: http://localhost:9000/arbook/uploads/... */
function getUploadsBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const isLocalhost = (url: string) =>
      url.includes('localhost') || url.includes('127.0.0.1')
    if (!isLocalhost(window.location.origin)) {
      return window.location.origin
    }
  }
  const env = import.meta.env.VITE_UPLOADS_BASE_URL
  const base = env != null && String(env).trim() !== '' ? String(env).trim().replace(/\/$/, '') : ''
  return base || getBaseUrl()
}

/** Полный URL к ассету. Path-style: http://localhost:9000/arbook/uploads/... */
export function getAssetUrl(path: string): string {
  if (!path) return path
  let p = path
  if (path.startsWith('http')) {
    if (typeof window !== 'undefined') {
      const isLocalhost = (url: string) =>
        url.includes('localhost') || url.includes('127.0.0.1')
      if (isLocalhost(path) && !isLocalhost(window.location.origin)) {
        const match = path.match(/^(https?:\/\/[^/]+)(\/.*)?$/)
        p = match ? (match[2] || '/') : path
        return window.location.origin + (p.startsWith('/') ? p : '/' + p)
      }
    }
    return path
  }
  const base = getUploadsBaseUrl()
  p = path.startsWith('/') ? path : '/' + path
  return base + p
}

export const markersApi = {
  getAll: () => MarkersService.getAllMarkers(),
  getById: (id: number) => MarkersService.getMarkerById(id),
  create: (formData: FormData) => MarkersService.createMarker(formData),
}

export async function getMarkers(): Promise<Marker[]> {
  return MarkersService.getAllMarkers()
}

export async function getMarkerById(id: number): Promise<Marker | null> {
  return MarkersService.getMarkerById(id)
}
