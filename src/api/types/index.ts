export interface Marker {
  id: number
  name: string
  mindFilePath: string
  glbModelPath: string
  audioPath: string
  scale: number
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token?: string
  message?: string
  success?: boolean
}

export interface ApiErrorData {
  message?: string
  error?: string
  title?: string
}
