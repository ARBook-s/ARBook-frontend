import { axiosInstance } from './axios/axiosInstance'
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
  getAll: () => axiosInstance.get<Marker[]>('/api/markers'),
  getById: (id: number) => axiosInstance.get<Marker>(`/api/markers/${id}`),
  create: (formData: FormData) => axiosInstance.post<Marker>('/api/markers', formData),
}

export async function getMarkers(): Promise<Marker[]> {
  const { data } = await markersApi.getAll()
  return data
}

export async function getMarkerById(id: number): Promise<Marker | null> {
  try {
    const { data } = await markersApi.getById(id)
    return data
  } catch {
    return null
  }
}
