<template>
  <main class="login" role="main">
    <a-card title="Вход в админ-панель" class="login__card">
      <a-form :model="form" layout="vertical" @submit.prevent="handleSubmit" aria-label="Форма авторизации">
        <a-form-item v-if="error" :validate-status="'error'" :help="error" />
        <a-form-item
          label="Имя пользователя"
          name="username"
          :rules="[{ required: true, message: 'Введите имя пользователя' }]"
        >
          <a-input v-model:value="form.username" type="text" placeholder="username" size="large" autocomplete="username" />
        </a-form-item>
        <a-form-item
          label="Пароль"
          name="password"
          :rules="[{ required: true, message: 'Введите пароль' }]"
        >
          <a-input-password v-model:value="form.password" placeholder="Пароль" size="large" autocomplete="current-password" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading">
            Войти
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/api/store/auth'

const router = useRouter()
const authStore = useAuthStore()
const form = reactive({ username: '', password: '' })
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    await authStore.login({ username: form.username, password: form.password })
    await router.push({ name: 'Admin' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка входа'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #f5f5f5;
}
.login__card {
  width: 100%;
  max-width: 400px;
}
</style>
