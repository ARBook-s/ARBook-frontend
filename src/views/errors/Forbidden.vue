<template>
  <main class="error-page" role="main">
    <a-result status="403" title="403" sub-title="Доступ запрещён">
      <template #extra>
        <a-button type="primary" @click="goHome" aria-label="Вернуться на главную страницу">На главную</a-button>
        <a-button v-if="authStore.isAuthenticated" @click="goAdmin" aria-label="Перейти в админ-панель">В админку</a-button>
        <a-button v-else @click="goLogin" aria-label="Перейти на страницу входа">Войти</a-button>
      </template>
    </a-result>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/api/store/auth'

const router = useRouter()
const authStore = useAuthStore()
const goHome = () => router.replace('/')
const goAdmin = () => router.replace('/admin')
const goLogin = () => router.replace('/login')
</script>
