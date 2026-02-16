import * as msgpack from '@msgpack/msgpack'
import { logger } from './logger'

const MIND_VERSION = 2

interface MindDataItem {
  targetImage: { width: number; height: number }
  trackingData: unknown[]
  matchingData: unknown[]
}

interface MindFile {
  v: number
  dataList: MindDataItem[]
}

/**
 * Объединяет несколько .mind файлов в один для поддержки нескольких маркеров.
 * MindAR требует один .mind файл с несколькими целями (targetIndex: 0, 1, 2...).
 */
export async function mergeMindFiles(mindUrls: string[]): Promise<string> {
  if (mindUrls.length === 0) throw new Error('Нет .mind файлов для объединения')
  const firstUrl = mindUrls[0]
  if (mindUrls.length === 1 && firstUrl) return firstUrl

  const results = await Promise.all(
    mindUrls
      .filter((url): url is string => !!url)
      .map(async (url): Promise<MindDataItem[]> => {
        const res = await fetch(url)
        if (!res.ok) {
          logger.warn(
            `[mergeMindFiles] Не удалось загрузить ${url}: ${res.status} ${res.statusText}`,
          )
          return []
        }

        let decoded: unknown
        try {
          const buffer = await res.arrayBuffer()
          decoded = msgpack.decode(new Uint8Array(buffer))
        } catch (e) {
          logger.warn(`[mergeMindFiles] Ошибка декодирования ${url}:`, e)
          return []
        }

        const mindFile = decoded as MindFile
        if (!mindFile || typeof mindFile !== 'object') {
          logger.warn(`[mergeMindFiles] Некорректный формат файла: ${url}`)
          return []
        }

        if (mindFile.v !== MIND_VERSION) {
          logger.warn(
            `[mergeMindFiles] Несовпадение версии .mind файла: ${url} (ожидалась ${MIND_VERSION}, получена ${mindFile.v})`,
          )
          return []
        }

        return Array.isArray(mindFile.dataList) ? mindFile.dataList : []
      }),
  )

  const mergedDataList = results.flat()

  if (mergedDataList.length === 0) {
    throw new Error('Не удалось загрузить ни одного .mind файла')
  }

  const combinedBuffer = msgpack.encode({
    v: MIND_VERSION,
    dataList: mergedDataList,
  })

  const blob = new Blob([new Uint8Array(combinedBuffer)], { type: 'application/octet-stream' })
  return URL.createObjectURL(blob)
}
