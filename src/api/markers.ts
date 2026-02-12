import MarkersService from './services/markersService'
import type { Marker } from '@/api/types'

/** Базовый URL бэкенда. В dev с proxy — тот же origin. */
function getBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL
  if (env != null && String(env).trim() !== '') {
    return String(env).trim().replace(/\/$/, '')
  }
  return typeof window !== 'undefined' ? window.location.origin : ''
}

/** Полный URL к ассету бэкенда. Запрос по id без расширения формата. */
export function getAssetUrl(path: string): string {
  if (!path) return path
  if (path.startsWith('http')) return path
  const base = getBaseUrl()
  let p = path.startsWith('/') ? path : '/' + path
  p = p.replace(/\.(glb|mind|mp3|wav|ogg|m4a)$/i, '')
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
