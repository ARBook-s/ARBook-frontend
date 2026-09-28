<template>
  <a-layout class="admin-layout">
    <a-layout-header class="admin-header">
      <span class="admin-header__title">ARBook — Админ</span>
      <nav class="admin-header__actions" aria-label="Действия администратора">
        <a-button type="link" @click="goToAr" aria-label="Перейти к AR-книге">AR-книга</a-button>
        <a-button type="primary" ghost @click="handleLogout" aria-label="Выйти из системы">
          Выйти
        </a-button>
      </nav>
    </a-layout-header>

    <a-layout class="admin-layout__inner">
      <a-layout-sider
        class="admin-sider"
        width="220"
        breakpoint="lg"
        collapsed-width="0"
        theme="dark"
      >
        <div class="admin-sider__title" aria-hidden="true">Навигация</div>
        <a-menu
          class="admin-menu"
          mode="inline"
          theme="dark"
          :selectedKeys="[activeMenuKey]"
          @click="onMenuClick"
          aria-label="Разделы админ-панели"
        >
          <a-menu-item key="markers"> Маркеры </a-menu-item>
          <a-menu-item key="stats"> Статистика запросов </a-menu-item>
        </a-menu>
      </a-layout-sider>

      <a-layout-content class="admin-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/api/store/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeMenuKey = computed<'markers' | 'stats'>(() => {
  if (route.name === 'AdminStats') return 'stats'
  return 'markers'
})

function onMenuClick({ key }: { key: 'markers' | 'stats' }) {
  if (key === 'markers') {
    void router.push({ name: 'AdminMarkers' })
  } else {
    void router.push({ name: 'AdminStats' })
  }
}

const goToAr = () => router.push('/')
const handleLogout = async () => {
  try {
    await authStore.logout()
  } catch {
    // токен очищается в finally
  }
  await router.replace('/login')
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}
.admin-layout__inner {
  min-height: calc(100vh - 64px);
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

.admin-sider {
  background: #001529;
}

.admin-sider__title {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.admin-menu {
  border-inline-end: none;
}

.admin-card {
  height: 100%;
}

.ua {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.action {
  font-size: 13px;
}
</style>
