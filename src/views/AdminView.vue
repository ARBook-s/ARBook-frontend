<template>
  <a-layout class="admin-layout">
    <a-layout-header class="admin-header">
      <span class="admin-header__title">ARBook — Админ</span>
      <div class="admin-header__actions">
        <a-button type="link" @click="goToAr">AR-книга</a-button>
        <a-button type="primary" ghost @click="handleLogout">
          Выйти
        </a-button>
      </div>
    </a-layout-header>
    <a-layout-content class="admin-content">
      <a-card title="Админ-панель">
        <h4>Добро пожаловать</h4>
        <p>Управление AR-маркерами и настройки приложения.</p>
      </a-card>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/api/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const goToAr = () => router.push('/')
const handleLogout = () => {
  authStore.logout()
  router.replace('/login')
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #001529;
  padding: 0 24px;
}
.admin-header__title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}
.admin-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.admin-header__actions :deep(.ant-btn-link) {
  color: rgba(255, 255, 255, 0.85);
}
.admin-header__actions :deep(.ant-btn-link:hover) {
  color: #fff;
}
.admin-content {
  padding: 24px;
  background: #f0f2f5;
}
.admin-content :deep(.ant-card) {
  max-width: 800px;
}
</style>
