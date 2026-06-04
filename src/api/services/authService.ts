import axiosInstance from '../axios/axiosInstance'
import { SESSION_FLAG } from '../authConstants'
import { throwApiError } from '../utils/handleApiError'
import type { AuthResponse } from '../types'

function getToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  const t = localStorage.getItem('token')
  return t && t !== '' ? t : null
}

class AuthService {
  /**
   * Авторизация. Сохраняет токен или SESSION_FLAG в localStorage.
   */
  static async loginAdmin(username: string, password: string): Promise<void> {
    try {
      const response = await axiosInstance.post<AuthResponse | string>('auth/login', {
        username,
        password,
      })
      const data = response.data
      const token = typeof data === 'object' && data !== null ? data.token : null
      if (token && typeof localStorage !== 'undefined') {
        localStorage.setItem('token', token)
      } else if (
        typeof localStorage !== 'undefined' &&
        (response.status === 200 || response.status === 201)
      ) {
        localStorage.setItem('token', SESSION_FLAG)
      }
    } catch (error: unknown) {
      throwApiError(error, 'Ошибка при авторизации')
    }
  }

  /**
   * Выход из системы. Всегда удаляет токен из localStorage.
   */
  static async logOut(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout')
    } catch (error: unknown) {
      throwApiError(error, 'Ошибка при выходе')
    } finally {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('token')
      }
    }
  }

  /** Проверка наличия токена/сессии. */
  static isAuthenticated(): boolean {
    return !!getToken()
  }
}

export default AuthService
