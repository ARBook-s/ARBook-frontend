<template>
  <div class="error-page">
    <a-result status="403" title="403" sub-title="Доступ запрещён">
      <template #extra>
        <a-button type="primary" @click="goHome">На главную</a-button>
        <a-button v-if="authStore.isAuthenticated" @click="goAdmin">В админку</a-button>
        <a-button v-else @click="goLogin">Войти</a-button>
      </template>
    </a-result>
  </div>
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

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f5f5f5;
}
.error-page :deep(.ant-result-extra) {
  display: flex;
  gap: 8px;
}
</style>
