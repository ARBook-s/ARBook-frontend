import { chromium, devices } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'docs', 'screenshots')

const pages = [
  { name: '01-start-screen', url: '/', wait: 1500 },
  { name: '02-help-usage', url: '/help/usage', wait: 1000 },
  { name: '03-help-install', url: '/help/install', wait: 1000 },
  { name: '04-admin-login', url: '/login', wait: 1000 },
]

async function capture() {
  await mkdir(outDir, { recursive: true })

  const iPhone = devices['iPhone 13']
  const browser = await chromium.launch({
    args: [
      '--ignore-certificate-errors',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  })

  const context = await browser.newContext({
    ...iPhone,
    ignoreHTTPSErrors: true,
    locale: 'ru-RU',
  })

  const page = await context.newPage()

  for (const item of pages) {
    await page.goto(`https://localhost:5173${item.url}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(item.wait)
    await page.screenshot({
      path: path.join(outDir, `${item.name}.png`),
      fullPage: true,
    })
    console.log(`Saved ${item.name}.png`)
  }

  // AR session start (camera permission auto-granted with fake device)
  await page.goto('https://localhost:5173/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Запустить камеру для AR' }).click()
  await page.waitForTimeout(5000)
  await page.screenshot({
    path: path.join(outDir, '05-ar-camera-active.png'),
    fullPage: false,
  })
  console.log('Saved 05-ar-camera-active.png')

  const statsBtn = page.getByRole('button', { name: /статистик/i })
  if (await statsBtn.isVisible().catch(() => false)) {
    await statsBtn.click()
    await page.waitForTimeout(500)
    await page.screenshot({
      path: path.join(outDir, '08-performance-stats.png'),
      fullPage: false,
    })
    console.log('Saved 08-performance-stats.png')
  }

  await browser.close()
}

capture().catch((err) => {
  console.error(err)
  process.exit(1)
})
