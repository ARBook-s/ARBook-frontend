/**
 * Валидация переменных окружения при старте приложения.
 * Предупреждает в dev-режиме если конфигурация может быть неполной.
 */
export function validateEnv(): void {
  if (!import.meta.env.DEV) return

  const warnings: string[] = []

  const apiBase = import.meta.env.VITE_API_BASE_URL
  if (!apiBase || String(apiBase).trim() === '') {
    warnings.push(
      'VITE_API_BASE_URL не задан — API-запросы пойдут через proxy (localhost:5173).',
    )
  }

  const uploadsBase = import.meta.env.VITE_UPLOADS_BASE_URL
  if (!uploadsBase || String(uploadsBase).trim() === '') {
    warnings.push(
      'VITE_UPLOADS_BASE_URL не задан — файлы будут загружаться через proxy или origin.',
    )
  }

  if (warnings.length > 0) {
    console.groupCollapsed(
      '%c[ARBook] Проверка env-переменных',
      'color: #e8a735; font-weight: bold',
    )
    warnings.forEach((w) => console.warn(w))
    console.log('Скопируйте .env.example → .env и заполните значения.')
    console.groupEnd()
  }
}
