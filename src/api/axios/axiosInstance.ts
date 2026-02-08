import axios, { type AxiosError } from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL != null && String(import.meta.env.VITE_API_BASE_URL).trim() !== ''
    ? String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/$/, '')
    : ''

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

// ——— Request interceptor ———
axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ——— Response interceptor ———
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string; title?: string }>) => {
    const status = error.response?.status
    const data = error.response?.data
    const message =
      data?.error ?? data?.message ?? data?.title ?? error.message ?? 'Ошибка запроса'

    if (status === 401) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('token')
      }
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        const redirect = encodeURIComponent(window.location.pathname)
        window.location.replace(`/login?redirect=${redirect}`)
        return Promise.reject(new Error('Сессия истекла'))
      }
    }

    if (status === 403 && typeof window !== 'undefined') {
      window.location.replace('/403')
      return Promise.reject(new Error('Доступ запрещён'))
    }

    const err = new Error(message) as Error & {
      status?: number
      data?: unknown
      isAxiosError: boolean
    }
    err.status = status
    err.data = data
    err.isAxiosError = true
    return Promise.reject(err)
  }
)

export default axiosInstance
