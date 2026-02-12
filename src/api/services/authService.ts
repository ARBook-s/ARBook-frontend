import axiosInstance from '../axios/axiosInstance'

export interface LoginCredentials {
  username: string
  password: string
}

function getToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  const t = localStorage.getItem('token')
  return t && t !== '' ? t : null
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

import { SESSION_FLAG } from '../authConstants'

export async function login(credentials: LoginCredentials): Promise<void> {
  const { username, password } = credentials
  try {
    const response = await axiosInstance.post<{ token?: string; message?: string; success?: boolean } | string>('/api/auth/login', {
      username,
      password,
    })
    const data = response.data
    const token = typeof data === 'object' && data !== null ? data.token : null
    if (token && typeof localStorage !== 'undefined') {
      localStorage.setItem('token', token)
    } else if (typeof localStorage !== 'undefined' && (response.status === 200 || response.status === 201)) {
      // API вернул только сообщение об успехе — сохраняем флаг сессии
      localStorage.setItem('token', SESSION_FLAG)
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string }
    const message =
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message ??
      'Ошибка при авторизации'
    throw new Error(message)
  }
}

export async function logout(): Promise<void> {
  try {
    await axiosInstance.post('/api/auth/logout')
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string }
    const message =
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message ??
      'Ошибка при выходе'
    throw new Error(message)
  } finally {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token')
    }
  }
}
