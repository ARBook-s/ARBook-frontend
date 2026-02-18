import MarkersService from './services/markersService'
import type { Marker } from '@/api/types'
import type { AxiosRequestConfig } from 'axios'

export { getAssetUrl } from './utils/baseUrl'

export const markersApi = {
  getAll: () => MarkersService.getAllMarkers(),
  getById: (id: number) => MarkersService.getMarkerById(id),
  create: (formData: FormData, config?: AxiosRequestConfig) =>
    MarkersService.createMarker(formData, config),
  update: (id: number, formData: FormData, config?: AxiosRequestConfig) =>
    MarkersService.updateMarker(id, formData, config),
  delete: (id: number) => MarkersService.deleteMarker(id),
}

export async function getMarkers(): Promise<Marker[]> {
  return MarkersService.getAllMarkers()
}

export async function getMarkerById(id: number): Promise<Marker | null> {
  return MarkersService.getMarkerById(id)
}
