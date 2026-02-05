import axiosInstance from '../axios/axiosInstance'
import type { Marker } from '../types'

class MarkersService {
  /**
   * Возвращает все маркеры.
   * GET /api/markers
   */
  static async getAllMarkers(): Promise<Marker[]> {
    try {
      const response = await axiosInstance.get<Marker[]>('/api/markers')
      return response.data
    } catch (error: unknown) {
      const data = (error as { response?: { data?: unknown } })?.response?.data
      throw new Error(String(data ?? 'Ошибка при получении маркеров'))
    }
  }

  /**
   * Возвращает маркер по идентификатору.
   * GET /api/markers/:id
   * @returns маркер или null, если не найден
   */
  static async getMarkerById(id: number): Promise<Marker | null> {
    try {
      const response = await axiosInstance.get<Marker>(`/api/markers/${id}`)
      return response.data
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 404) return null
      const data = (error as { response?: { data?: unknown } })?.response?.data
      throw new Error(String(data ?? 'Ошибка при получении маркера'))
    }
  }

  /**
   * Создаёт маркер. POST /api/markers
   * Отправка в формате multipart/form-data. Обязательные поля:
   * - name — название маркера (строка)
   * - mind — файл разметки (.mind)
   * - glb — 3D-модель в формате GLB
   * - audio — аудиофайл (.mp3, .wav, .ogg, .m4a)
   * Для mind и glb максимальный размер задаётся в конфигурации бэкенда (по умолчанию 50 МБ).
   */
  static async createMarker(formData: FormData): Promise<Marker> {
    try {
        const response = await axiosInstance.post<Marker>('/api/markers', formData)
        return response.data
    } catch (error: unknown) {
      const data = (error as { response?: { data?: unknown } })?.response?.data
      throw new Error(String(data ?? 'Ошибка при создании маркера'))
    }
  }
}

export default MarkersService