import path from 'path'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import commonjs from 'vite-plugin-commonjs'
import vue from '@vitejs/plugin-vue'

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
