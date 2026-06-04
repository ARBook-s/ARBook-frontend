import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('baseUrl utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  describe('getAssetUrl', () => {
    it('returns empty string for empty path', async () => {
      const { getAssetUrl } = await import('./baseUrl')
      expect(getAssetUrl('')).toBe('')
    })

    it('returns absolute URL unchanged on localhost', async () => {
      const { getAssetUrl } = await import('./baseUrl')
      const url = 'http://localhost:9000/uploads/model.glb'
      expect(getAssetUrl(url)).toBe(url)
    })

    it('prepends base URL to relative paths', async () => {
      const { getAssetUrl } = await import('./baseUrl')
      const result = getAssetUrl('uploads/model.glb')
      expect(result).toContain('uploads/model.glb')
    })

    it('handles paths starting with /', async () => {
      const { getAssetUrl } = await import('./baseUrl')
      const result = getAssetUrl('/uploads/model.glb')
      expect(result).toContain('/uploads/model.glb')
      expect(result).not.toContain('//uploads')
    })
  })

  describe('getApiBaseUrl', () => {
    it('returns /api when env is not set', async () => {
      vi.stubEnv('VITE_API_BASE_URL', '')
      vi.resetModules()
      const { getApiBaseUrl } = await import('./baseUrl')
      expect(getApiBaseUrl()).toBe('/api')
    })
  })
})
