import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/api/services/authService', () => ({
  default: {
    loginAdmin: vi.fn(),
    logOut: vi.fn(),
    isAuthenticated: vi.fn(() => false),
  },
}))

import { useAuthStore } from './auth'
import AuthService from '@/api/services/authService'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('starts not authenticated', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.initialized).toBe(false)
  })

  it('init() marks store as initialized and checks auth', () => {
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true)
    const store = useAuthStore()
    store.init()
    expect(store.initialized).toBe(true)
    expect(store.isAuthenticated).toBe(true)
  })

  it('login() calls AuthService and sets isAuthenticated', async () => {
    vi.mocked(AuthService.loginAdmin).mockResolvedValue()
    const store = useAuthStore()
    await store.login({ username: 'admin', password: 'pass' })
    expect(AuthService.loginAdmin).toHaveBeenCalledWith('admin', 'pass')
    expect(store.isAuthenticated).toBe(true)
  })

  it('logout() calls AuthService and clears isAuthenticated', async () => {
    vi.mocked(AuthService.logOut).mockResolvedValue()
    const store = useAuthStore()
    store.isAuthenticated = true
    await store.logout()
    expect(AuthService.logOut).toHaveBeenCalled()
    expect(store.isAuthenticated).toBe(false)
  })
})
