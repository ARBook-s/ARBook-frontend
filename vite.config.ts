import path from 'path'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import commonjs from 'vite-plugin-commonjs'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

/** Плагин для .html?raw в mind-ar-ts (esbuild не умеет их по умолчанию) */
function htmlRawPlugin() {
  return {
    name: 'html-raw',
    load(id: string) {
      if (id.includes('.html') && id.endsWith('?raw')) {
        const filePath = id.replace(/\?raw$/, '')
        return `export default ${JSON.stringify(readFileSync(filePath, 'utf-8'))}`
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    basicSsl(),
    commonjs({
      filter(id) {
        if (!id.includes('node_modules') || id.includes('.vue')) return false
        if (id.includes('.css') || id.includes('.scss')) return false
        return true
      },
    }),
    htmlRawPlugin(),
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.jpg'],
      manifest: {
        name: 'ARBook — Интерактивная AR-книга',
        short_name: 'ARBook',
        description: 'Наведите камеру на маркер и оживите иллюстрации',
        theme_color: '#0d5c63',
        background_color: '#f8f4ee',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          {
            src: '/logo.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
          },
          {
            src: '/logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\/markers$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'markers-api',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 5 },
            },
          },
          {
            urlPattern: /\.(glb|mind)(\?.*)?$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ar-assets',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(mp3|wav|ogg|m4a)(\?.*)?$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-assets',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['mind-ar-ts'],
    include: ['long'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three': ['three'],
          'vendor-tf': ['@tensorflow/tfjs', '@tensorflow/tfjs-backend-webgl'],
          'vendor-antd': ['ant-design-vue'],
        },
      },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    host: true, // слушать на 0.0.0.0 — доступ с телефона в той же Wi‑Fi сети
    // HTTPS включается плагином basicSsl — нужен для камеры на телефоне (getUserMedia)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/arbook': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      '/swagger': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
