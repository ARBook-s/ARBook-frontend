import MarkersService from './services/markersService'
import type { Marker } from '@/api/types'

export { getAssetUrl } from './utils/baseUrl'

export const markersApi = {
  getAll: () => MarkersService.getAllMarkers(),
  getById: (id: number) => MarkersService.getMarkerById(id),
  create: (formData: FormData) => MarkersService.createMarker(formData),
  update: (id: number, formData: FormData) => MarkersService.updateMarker(id, formData),
  delete: (id: number) => MarkersService.deleteMarker(id),
}

export async function getMarkers(): Promise<Marker[]> {
  return MarkersService.getAllMarkers()
}

export async function getMarkerById(id: number): Promise<Marker | null> {
  return MarkersService.getMarkerById(id)
}
