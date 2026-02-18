import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('validateEnv', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('logs warnings in dev mode when env vars are empty', async () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_API_BASE_URL', '')
    vi.stubEnv('VITE_UPLOADS_BASE_URL', '')
    vi.resetModules()

    const groupSpy = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})

    const { validateEnv } = await import('./validateEnv')
    validateEnv()

    expect(groupSpy).toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledTimes(2)
    expect(logSpy).toHaveBeenCalled()
    expect(groupEndSpy).toHaveBeenCalled()
  })

  it('does not log in production mode', async () => {
    vi.stubEnv('DEV', false)
    vi.resetModules()

    const groupSpy = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {})

    const { validateEnv } = await import('./validateEnv')
    validateEnv()

    expect(groupSpy).not.toHaveBeenCalled()
  })
})
