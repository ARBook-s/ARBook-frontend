/**
 * Конфигурация маршрутов ARBook.
 * Используется для документации и единообразия meta.
 *
 * Обработка ошибок:
 * - 401 — редирект на /login (в axios), сессия истекла
 * - 403 — редирект на /403 (в axios), доступ запрещён
 * - 404 — catch-all маршрут, страница не найдена
 */
export const ROUTES = {
  HOME: {
    path: '/',
    name: 'home',
    title: 'AR-книга',
    description: 'Интерактивная AR-книга с дополненной реальностью. Наведите камеру на маркер.',
  },
  LOGIN: {
    path: '/login',
    name: 'login',
    title: 'Вход',
    description: 'Вход в админ-панель ARBook.',
  },
  ADMIN: {
    path: '/admin',
    name: 'admin',
    title: 'Админ-панель',
    description: 'Управление AR-маркерами и настройками приложения.',
    requiresAuth: true,
  },
  FORBIDDEN: {
    path: '/403',
    name: 'forbidden',
    title: 'Доступ запрещён',
    description: 'У вас нет прав для просмотра этой страницы.',
    errorCode: 403,
  },
  NOT_FOUND: {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    title: 'Страница не найдена',
    description: 'Запрашиваемая страница не существует.',
    errorCode: 404,
  },
} as const
