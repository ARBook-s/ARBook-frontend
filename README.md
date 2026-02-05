# ARBook — фронтенд

Vue 3 + TypeScript + Vite. Работает с бэкендом ARBook (API маркеров).

## Запуск вместе с бэкендом

1. **Запустите бэкенд** (один из вариантов):
   - Локально: из папки `ARBook-backend/ARBookl-backend` выполните `dotnet run` (порт по умолчанию из `launchSettings.json` или 5056).
   - Docker: из папки `ARBook-backend` выполните `docker compose up -d`. API будет на порту 8080 (или как в `docker-compose.yml`).

2. **Укажите порт бэкенда в proxy** (если не 5056): в корне фронта откройте `vite.config.ts` и в `server.proxy` для `/api` и `/uploads` задайте `target: 'http://localhost:ПОРТ'` (например `http://localhost:8080` при запуске через Docker).

3. **Установите зависимости и запустите фронт:**
   ```bash
   npm install
   npm run dev
   ```

4. Откройте в браузере **http://localhost:5173**. Запросы к `/api/*` и `/uploads/*` будут проксироваться на бэкенд.

## API-клиент

В коде используйте `src/api/client.ts`:

```ts
import { markersApi, type MarkerDto } from '@/api/client'

// Список маркеров
const { data } = await markersApi.getAll()

// Один маркер
const { data } = await markersApi.getById(1)

// Создать маркер (FormData с полями name, mind, glb, audio)
const formData = new FormData()
formData.set('name', 'Название')
formData.set('mind', mindFile)
formData.set('glb', glbFile)
formData.set('audio', audioFile)
const { data } = await markersApi.create(formData)
```

Переменная окружения `VITE_API_BASE_URL`: если пустая, в dev запросы идут на тот же origin (через proxy). Для продакшена задайте полный URL бэкенда.

---

Vue 3 `<script setup>` — [docs](https://vuejs.org/api/sfc-script-setup.html). [Vue TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
