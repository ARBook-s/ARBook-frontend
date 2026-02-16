import { defineStore } from 'pinia'
import AuthService from '@/api/services/authService'
import type { LoginCredentials } from '@/api/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    initialized: false,
    isAuthenticated: false,
  }),
  actions: {
    async login(credentials: LoginCredentials) {
      await AuthService.loginAdmin(credentials.username, credentials.password)
      this.isAuthenticated = true
    },
    async logout() {
      await AuthService.logOut()
      this.isAuthenticated = false
    },
    init() {
      this.initialized = true
      this.isAuthenticated = AuthService.isAuthenticated()
    },
  },
})
