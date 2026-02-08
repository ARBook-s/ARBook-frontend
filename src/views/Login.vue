<template>
  <div class="login">
    <a-card title="Вход в админ-панель" class="login__card">
      <a-form
        :model="form"
        layout="vertical"
        @submit.prevent="handleSubmit"
      >
        <a-form-item v-if="error" :validate-status="'error'" :help="error" />
        <a-form-item label="Email" name="email" :rules="[{ required: true, message: 'Введите email' }]">
          <a-input
            v-model:value="form.email"
            type="email"
            placeholder="email@example.com"
            size="large"
          />
        </a-form-item>
        <a-form-item label="Пароль" name="password" :rules="[{ required: true, message: 'Введите пароль' }]">
          <a-input-password
            v-model:value="form.password"
            placeholder="Пароль"
            size="large"
          />
        </a-form-item>
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            Войти
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/api/store/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    await authStore.login({ email: form.email, password: form.password })
    const r = route.query.redirect
    const path =
      typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : '/admin'
    router.replace(path)
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
