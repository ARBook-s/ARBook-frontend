import axiosInstance from '../axios/axiosInstance'
import { isAxiosError } from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { throwApiError } from '../utils/handleApiError'
import type { Marker } from '../types'

class MarkersService {
  /**
   * Возвращает все маркеры.
   * GET /api/markers
   */
  static async getAllMarkers(): Promise<Marker[]> {
    try {
      const response = await axiosInstance.get<Marker[]>('markers', {
        params: { _t: Date.now() },
      })
      return response.data
    } catch (error: unknown) {
      throwApiError(error, 'Ошибка при получении маркеров')
    }
  }

  /**
   * Возвращает маркер по идентификатору.
   * GET /api/markers/:id
   * @returns маркер или null, если не найден
   */
  static async getMarkerById(id: number): Promise<Marker | null> {
    try {
      const response = await axiosInstance.get<Marker>(`markers/${id}`)
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) return null
      throwApiError(error, 'Ошибка при получении маркера')
    }
  }

  /**
   * Создаёт маркер. POST markers
   * Отправка в формате multipart/form-data. Обязательные поля:
   * - name, mind (.mind), glb (.glb), audio (.mp3/.wav/.ogg/.m4a)
   */
  static async createMarker(formData: FormData, config?: AxiosRequestConfig): Promise<Marker> {
    try {
      const response = await axiosInstance.post<Marker>('markers', formData, config)
      return response.data
    } catch (error: unknown) {
      throwApiError(error, 'Ошибка при создании маркера')
    }
  }

  /**
   * Обновляет маркер. markers/:id
   * Отправка multipart/form-data. Можно передать только изменённые поля.
   */
  static async updateMarker(
    id: number,
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<Marker> {
    try {
      const response = await axiosInstance.patch<Marker>(`markers/${id}`, formData, config)
      return response.data
    } catch (error: unknown) {
      throwApiError(error, 'Ошибка при обновлении маркера')
    }
  }

  /**
   * Удаляет маркер. DELETE markers/:id
   */
  static async deleteMarker(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`markers/${id}`)
    } catch (error: unknown) {
      throwApiError(error, 'Ошибка при удалении маркера')
    }
  }
}

export default MarkersService
