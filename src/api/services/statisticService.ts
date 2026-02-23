import axiosInstance from '../axios/axiosInstance'
import { throwApiError } from '../utils/handleApiError'
import type { StatisticsPage } from '../types'

class StatisticsService {
  /**
   * Возвращает страницу статистики запросов.
   * GET /api/statistics?pageNumber=1&pageSize=20
   */
  static async getStatistics(pageNumber: number, pageSize: number): Promise<StatisticsPage> {
    try {
      const response = await axiosInstance.get<StatisticsPage>('/api/statistics', {
        params: {
          pageNumber,
          pageSize,
        },
      })
      return response.data
    } catch (error: unknown) {
      throwApiError(error, 'Ошибка при получении статистики запросов')
    }
  }
}

export default StatisticsService