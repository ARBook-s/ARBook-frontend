import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import ArView from '@/views/ArView.vue'
import Login from '@/views/Login.vue'
import AdminView from '@/views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: ArView },
    { path: '/login', component: Login },
    {
      path: '/admin',
      component: AdminView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }
  return true
})

export default router
