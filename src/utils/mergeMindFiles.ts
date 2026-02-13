import * as msgpack from '@msgpack/msgpack'

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

  const mergedDataList: MindDataItem[] = []

  for (const url of mindUrls) {
    if (!url) continue
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()
    const decoded = msgpack.decode(new Uint8Array(buffer)) as MindFile
    if (decoded?.v === MIND_VERSION && Array.isArray(decoded.dataList)) {
      mergedDataList.push(...decoded.dataList)

    }
  }

  const combinedBuffer = msgpack.encode({
    v: MIND_VERSION,
    dataList: mergedDataList,
  })

  const blob = new Blob([new Uint8Array(combinedBuffer)], { type: 'application/octet-stream' })
  return URL.createObjectURL(blob)
}
