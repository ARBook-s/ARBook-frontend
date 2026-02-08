<template>
  <div class="admin">
    <header class="admin__header">
      <h1>Админ-панель</h1>
      <router-link to="/" class="admin__link">AR-книга</router-link>
      <button class="admin__logout" @click="handleLogout">Выйти</button>
    </header>
    <main class="admin__main">
      <p>Добро пожаловать в админ-раздел.</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin {
  min-height: 100vh;
  background: #1a1a2e;
  color: #eee;
}
.admin__header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 2rem;
  border-bottom: 1px solid #333;
}
.admin__header h1 {
  margin: 0;
  font-size: 1.25rem;
}
.admin__link {
  color: #646cff;
  text-decoration: none;
}
.admin__link:hover {
  text-decoration: underline;
}
.admin__logout {
  margin-left: auto;
  padding: 0.5rem 1rem;
  border: 1px solid #555;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.admin__logout:hover {
  background: #333;
}
.admin__main {
  padding: 2rem;
}
</style>
