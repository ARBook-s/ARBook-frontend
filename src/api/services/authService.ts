import axiosInstance from '../axios/axiosInstance'

export interface LoginCredentials {
  username: string
  password: string
}

function getToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem('token')
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export async function login(credentials: LoginCredentials): Promise<void> {
  const { username, password } = credentials
  try {
    const response = await axiosInstance.post<{ token?: string } | string>('/api/auth/login', {
      username,
      password,
    })
    const data = response.data
    const token = typeof data === 'string' ? data : data?.token
    if (token && typeof localStorage !== 'undefined') {
      localStorage.setItem('token', token)
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
