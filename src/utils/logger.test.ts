import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should call console methods in dev mode', async () => {
    vi.stubEnv('DEV', true)
    vi.resetModules()

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { logger } = await import('./logger')
    logger.info('test info')
    logger.warn('test warn')
    logger.error('test error')

    expect(logSpy).toHaveBeenCalledWith('test info')
    expect(warnSpy).toHaveBeenCalledWith('test warn')
    expect(errorSpy).toHaveBeenCalledWith('test error')
  })
})
