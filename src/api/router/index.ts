import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/api/store/auth'
import ArView from '@/views/ArView.vue'
import Login from '@/views/Login.vue'
import AdminView from '@/views/AdminView.vue'
import NotFound from '@/views/errors/NotFound.vue'
import Forbidden from '@/views/errors/Forbidden.vue'

const APP_TITLE = 'ARBook'

/**
 * Маршруты приложения.
 * meta.title — заголовок вкладки браузера.
 * meta.description — описание страницы (для meta tag).
 * meta.requiresAuth — требуется авторизация.
 * meta.errorCode — код ошибки (403, 404).
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: ArView,
    meta: {
      title: 'AR-книга',
      description: 'Интерактивная AR-книга с дополненной реальностью. Наведите камеру на маркер.',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: 'Вход',
      description: 'Вход в админ-панель ARBook.',
    },
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: {
      title: 'Админ-панель',
      description: 'Управление AR-маркерами и настройками приложения.',
      requiresAuth: true,
    },
  },
  {
    path: '/403',
    name: 'forbidden',
    component: Forbidden,
    meta: {
      title: 'Доступ запрещён',
      description: 'У вас нет прав для просмотра этой страницы.',
      errorCode: 403,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: {
      title: 'Страница не найдена',
      description: 'Запрашиваемая страница не существует.',
      errorCode: 404,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/** Обновляет document.title и meta description при смене маршрута. */
function updateDocumentMeta(to: { meta?: { title?: string; description?: string } }) {
  const title = to.meta?.title
  document.title = title ? `${title} — ${APP_TITLE}` : APP_TITLE

  const description = to.meta?.description
  let metaDesc = document.querySelector('meta[name="description"]')
  if (description) {
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', description)
  } else if (metaDesc) {
    metaDesc.remove()
  }
}

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath }, replace: true }
    }
  }
  if (to.path === '/login' && useAuthStore().isAuthenticated) {
    const redirect = to.query.redirect
    const path =
      typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
        ? redirect
        : '/admin'
    return { path, replace: true }
  }
  return true
})

router.afterEach((to) => {
  updateDocumentMeta(to)
})

export default router
