import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/api/store/auth'

// Lazy-loaded: Three.js + MindAR + TensorFlow грузятся только при переходе на AR
const ArView = () => import('@/views/ArView.vue')
const AdminView = () => import('@/views/AdminView.vue')
const AdminMarkersView = () => import('@/views/admin/AdminMarkersView.vue')
const AdminStatsView = () => import('@/views/admin/AdminStatsView.vue')

// Лёгкие страницы — в основном бандле
import Login from '@/views/Login.vue'
import HelpView from '@/views/HelpView.vue'
import HelpIndex from '@/views/help/HelpIndex.vue'
import HelpUsage from '@/views/help/HelpUsage.vue'
import HelpInstall from '@/views/help/HelpInstall.vue'
import HelpFaq from '@/views/help/HelpFaq.vue'
import NotFound from '@/views/errors/NotFound.vue'
import Forbidden from '@/views/errors/Forbidden.vue'

const APP_TITLE = 'ARBook'
const DEFAULT_DESCRIPTION =
  'ARBook — интерактивная книга с дополненной реальностью. Наведите камеру на страницу и оживите иллюстрации.'

/**
 * Маршруты приложения.
 * meta.title — заголовок вкладки браузера.
 * meta.description — описание страницы (для meta tag и OG).
 * meta.requiresAuth — требуется авторизация.
 * meta.noIndex — запретить индексацию (для admin, login, ошибок).
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
    path: '/help',
    component: HelpView,
    children: [
      {
        path: '',
        name: 'help',
        component: HelpIndex,
        meta: {
          title: 'Как пользоваться',
          description: 'Инструкция по использованию AR-книги и установке приложения на телефон.',
        },
      },
      {
        path: 'usage',
        name: 'help-usage',
        component: HelpUsage,
        meta: {
          title: 'Как работает AR-книга',
          description: 'Пошаговая инструкция по использованию AR-книги.',
        },
      },
      {
        path: 'install',
        name: 'help-install',
        component: HelpInstall,
        meta: {
          title: 'Установка на телефон',
          description: 'Как добавить ARBook на домашний экран телефона.',
        },
      },
      {
        path: 'faq',
        name: 'help-faq',
        component: HelpFaq,
        meta: {
          title: 'Частые вопросы',
          description: 'Ответы на частые вопросы по работе AR-книги.',
        },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'Вход',
      description: 'Вход в админ-панель ARBook.',
      noIndex: true,
    },
  },
  {
    path: '/admin',
    component: AdminView,
    meta: {
      title: 'Админ-панель',
      description: 'Управление AR-маркерами и настройками приложения.',
      requiresAuth: true,
      noIndex: true,
    },
    children: [
      {
        path: '',
        redirect: { name: 'AdminMarkers' },
      },
      {
        path: 'markers',
        name: 'AdminMarkers',
        component: AdminMarkersView,
        meta: {
          title: 'Маркеры',
          description: 'Управление AR-маркерами.',
          requiresAuth: true,
          noIndex: true,
        },
      },
      {
        path: 'stats',
        name: 'AdminStats',
        component: AdminStatsView,
        meta: {
          title: 'Статистика запросов',
          description: 'Статистика запросов к API.',
          requiresAuth: true,
          noIndex: true,
        },
      },
    ],
  },
  {
    path: '/403',
    name: 'forbidden',
    component: Forbidden,
    meta: {
      title: 'Доступ запрещён',
      description: 'У вас нет прав для просмотра этой страницы.',
      errorCode: 403,
      noIndex: true,
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
      noIndex: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/** Устанавливает или обновляет мета-тег. */
function setMeta(attr: string, key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Обновляет document.title, description, OG, canonical и robots при смене маршрута. */
function updateDocumentMeta(
  to: {
    path: string
    meta?: {
      title?: string
      description?: string
      noIndex?: boolean
    }
  },
) {
  const title = to.meta?.title
  const fullTitle = title ? `${title} — ${APP_TITLE}` : APP_TITLE
  const description = to.meta?.description || DEFAULT_DESCRIPTION

  // Title
  document.title = fullTitle

  // Standard meta
  setMeta('name', 'description', description)

  // Open Graph
  setMeta('property', 'og:title', fullTitle)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', window.location.origin + to.path)

  // Twitter Card
  setMeta('name', 'twitter:title', fullTitle)
  setMeta('name', 'twitter:description', description)

  // Canonical
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.href = window.location.origin + to.path

  // Robots: noindex для admin/login/ошибок
  setMeta('name', 'robots', to.meta?.noIndex ? 'noindex, nofollow' : 'index, follow')
}

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath }, replace: true }
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
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
