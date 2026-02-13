import { defineStore } from 'pinia'
import authService from '@/api/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    initialized: false,
    isAuthenticated: false,
  }),
  actions: {
    async login(credentials: { username: string; password: string }) {
      await authService.LoginAdmin(credentials.username, credentials.password)
      this.isAuthenticated = true
    },
    async logout() {
      await authService.LogOut()
      this.isAuthenticated = false
    },
    init() {
      this.initialized = true
      this.isAuthenticated = authService.IsAuthenticated()
    },
  },
})
