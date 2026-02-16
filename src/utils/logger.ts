const isDev = import.meta.env.DEV

/**
 * Простой логгер с отключением в production.
 * В dev-режиме выводит в console, в production — тишина.
 */
export const logger = {
  info(...args: unknown[]) {
    if (isDev) console.log(...args)
  },
  warn(...args: unknown[]) {
    if (isDev) console.warn(...args)
  },
  error(...args: unknown[]) {
    if (isDev) console.error(...args)
  },
}
