import { describe, it, expect } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { extractApiErrorMessage, throwApiError } from './handleApiError'

function makeAxiosError(data: unknown, status = 400): AxiosError {
  const headers = new AxiosHeaders()
  const error = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data,
    status,
    statusText: 'Bad Request',
    headers,
    config: { headers },
  })
  return error
}

describe('extractApiErrorMessage', () => {
  it('extracts message from axios response with .message field', () => {
    const err = makeAxiosError({ message: 'Не найдено' })
    expect(extractApiErrorMessage(err, 'fallback')).toBe('Не найдено')
  })

  it('extracts message from axios response with .error field', () => {
    const err = makeAxiosError({ error: 'Forbidden' })
    expect(extractApiErrorMessage(err, 'fallback')).toBe('Forbidden')
  })

  it('extracts message from axios response with .title field', () => {
    const err = makeAxiosError({ title: 'Server Error' })
    expect(extractApiErrorMessage(err, 'fallback')).toBe('Server Error')
  })

  it('uses string data from response', () => {
    const err = makeAxiosError('plain text error')
    expect(extractApiErrorMessage(err, 'fallback')).toBe('plain text error')
  })

  it('falls back to axios error.message', () => {
    const err = makeAxiosError(null)
    expect(extractApiErrorMessage(err, 'fallback')).toBe('Request failed')
  })

  it('handles standard Error', () => {
    const err = new Error('something broke')
    expect(extractApiErrorMessage(err, 'fallback')).toBe('something broke')
  })

  it('returns fallback for unknown error types', () => {
    expect(extractApiErrorMessage(42, 'fallback')).toBe('fallback')
    expect(extractApiErrorMessage(null, 'fallback')).toBe('fallback')
    expect(extractApiErrorMessage(undefined, 'fallback')).toBe('fallback')
  })
})

describe('throwApiError', () => {
  it('throws an Error with extracted message', () => {
    const err = makeAxiosError({ message: 'Ошибка валидации' })
    expect(() => throwApiError(err, 'fallback')).toThrowError('Ошибка валидации')
  })

  it('throws with fallback when no message available', () => {
    expect(() => throwApiError({}, 'Ошибка по умолчанию')).toThrowError('Ошибка по умолчанию')
  })
})
