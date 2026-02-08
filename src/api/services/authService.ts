import axiosInstance from '../axios/axiosInstance'

const TOKEN_KEY = 'token'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export function isAuthenticated(): boolean {
  return typeof localStorage !== 'undefined' && !!localStorage.getItem(TOKEN_KEY)
}

export function getToken(): string | null {
  return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
}

export async function login(credentials: LoginCredentials): Promise<void> {
  const { data } = await axiosInstance.post<LoginResponse>('/api/auth/login', credentials)
  if (data.token) {
    localStorage.setItem(TOKEN_KEY, data.token)
  }
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY)
}
