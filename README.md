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

4. Откройте в браузере **http://localhost:5173** (или **https://localhost:5173**). Запросы к `/api/*`, `/uploads/*`, `/arbook/*` будут проксироваться на бэкенд и MinIO.

### Запуск на телефоне

1. Убедитесь, что компьютер и телефон в одной Wi‑Fi сети.
2. Запустите `npm run dev` — в консоли появится сетевой адрес вида `https://192.168.x.x:5173`.
3. Откройте этот адрес в браузере на телефоне.
4. При первом заходе браузер может предупредить о самоподписанном сертификате — нажмите «Дополнительно» → «Перейти на сайт».
5. **Ошибка при получении маркеров или загрузке файлов:** в `.env` оставьте `VITE_API_BASE_URL` и `VITE_UPLOADS_BASE_URL` пустыми — запросы пойдут через proxy. Если они указывают на `localhost`, на телефоне это не работает (телефон не видит ваш компьютер).

## API-клиент

В коде используйте `src/api/markers.ts` или `src/api/services/markersService.ts`:

```ts
import { markersApi, getMarkers, getAssetUrl } from '@/api/markers'
import type { Marker } from '@/api/types'

// Список маркеров
const markers = await markersApi.getAll()

// Один маркер
const marker = await markersApi.getById(1)

// Создать маркер (FormData с полями name, mind, glb, audio)
const formData = new FormData()
formData.append('name', 'Название')
formData.append('mind', mindFile)
formData.append('glb', glbFile)
formData.append('audio', audioFile)
const marker = await markersApi.create(formData)

// URL к ассету для AR
const glbUrl = getAssetUrl(marker.glbModelPath)
```

Переменные окружения:
- `VITE_API_BASE_URL` — если пустая, в dev запросы идут на тот же origin (через proxy). Для продакшена задайте полный URL бэкенда.
- `VITE_UPLOADS_BASE_URL` — URL хранилища файлов (MinIO/S3 path-style), например `http://localhost:9000` для `http://localhost:9000/arbook/uploads/...`. Если пусто — используется `VITE_API_BASE_URL`.

---

Vue 3 `<script setup>` — [docs](https://vuejs.org/api/sfc-script-setup.html). [Vue TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
