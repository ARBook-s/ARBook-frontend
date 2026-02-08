<template>
  <div class="login">
    <form class="login__form" @submit.prevent="handleSubmit">
      <h2>Вход в админ-панель</h2>
      <div v-if="error" class="login__error">{{ error }}</div>
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
        autocomplete="email"
        class="login__input"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Пароль"
        required
        autocomplete="current-password"
        class="login__input"
      />
      <button type="submit" class="login__btn" :disabled="loading">
        {{ loading ? 'Вход...' : 'Войти' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    await authStore.login({ email: email.value, password: password.value })
    const redirect = (route.query.redirect as string) || '/admin'
    router.push(redirect)
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
  display: grid;
  place-content: center;
  background: #1a1a2e;
  color: #eee;
}
.login__form {
  width: 100%;
  max-width: 320px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.login__form h2 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}
.login__error {
  padding: 0.5rem;
  background: rgba(220, 53, 69, 0.2);
  color: #f66;
  border-radius: 6px;
  font-size: 0.9rem;
}
.login__input {
  padding: 0.75rem 1rem;
  border: 1px solid #444;
  border-radius: 8px;
  background: #0f0f1a;
  color: inherit;
  font-size: 1rem;
}
.login__input::placeholder {
  color: #888;
}
.login__input:focus {
  outline: none;
  border-color: #646cff;
}
.login__btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: #646cff;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
}
.login__btn:hover:not(:disabled) {
  background: #535bf2;
}
.login__btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
