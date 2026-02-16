import { isAxiosError } from 'axios'

/**
 * Извлекает человекочитаемое сообщение об ошибке из Axios-ответа.
 * Используется в сервисах для единообразной обработки ошибок API.
 */
export function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>
      const msg = obj.message ?? obj.error ?? obj.title
      if (typeof msg === 'string') return msg
    }
    if (typeof data === 'string' && data.length > 0) return data
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return fallback
}

/**
 * Оборачивает ошибку в Error с понятным сообщением.
 */
export function throwApiError(error: unknown, fallback: string): never {
  throw new Error(extractApiErrorMessage(error, fallback))
}
