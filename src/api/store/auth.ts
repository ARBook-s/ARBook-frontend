import { defineStore } from 'pinia'
import {
  login as apiLogin,
  logout as apiLogout,
  isAuthenticated,
} from '@/api/services/authService'
import type { LoginCredentials } from '@/api/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    initialized: false,
  }),
  getters: {
    isAuthenticated: () => isAuthenticated(),
  },
  actions: {
    async login(credentials: LoginCredentials) {
      await apiLogin(credentials)
    },
    async logout() {
      await apiLogout()
    },
    init() {
      this.initialized = true
    },
  },
})
