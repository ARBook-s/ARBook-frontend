# 1.1.1 Требования к функциональным характеристикам

В этом подразделе я показываю, как в системе ARBook выполняются функциональные требования из ТЗ: что реально сделано в коде, какие алгоритмы и готовые средства (библиотеки, платформы) задействованы и какие модули за что отвечают на клиенте и на сервере. Ниже всё сведено в таблицу — так проще сопоставить формулировки задания с фактической логикой приложения.

## 1.1.1.1 Соответствие требованиям и способ их выполнения

Таблица 1.1 — Соответствие функциональным требованиям

| № п/п | Требование | Реализация и алгоритм | Модули (пути) |
|:-----:|------------|----------------------|---------------|
| 1 | Распознавание маркеров, привязка модели к маркеру, обновление при движении камеры | MindAR (image target), `GET /api/markers/combined-mind`, якоря по индексам маркеров; цикл `setAnimationLoop`, `render`, поза якоря — от трекинга MindAR | `src/composables/useArScene.ts` |
| 2 | Загрузка, рендеринг GLB, анимации | `GLTFLoader`, Draco при необходимости; отложенная загрузка по `onTargetFound`; `AnimationMixer` + `mixer.update(delta)` | `src/composables/useArScene.ts` |
| 3 | Масштабирование, поворот, перемещение модели пользователем | Масштаб: `BASE_SCALE * marker.scale` (атрибут из БД, правка в админке). Поворот по Y: накопление `manualRotationY` от смещения указателя. Перемещение по жесту в мире не реализовано — следование за маркером через якорь | `src/composables/useArScene.ts`, `src/composables/useModelRotation.ts`, `src/constants/ar.ts`, `src/components/MarkerFormModal.vue` |
| 4 | Аудио и синхронизация со сценой | `HTMLAudioElement` на маркер; `play` / `pause` по `onTargetFound` / `onTargetLost`; разблокировка автоплея — `useAudioUnlock` | `src/composables/useArScene.ts`, `src/composables/useAudioUnlock.ts` |
| 5 | Загрузка и хранение контента, REST, метаданные | `MarkersController`: multipart, валидация, `UploadAsync` в S3/MinIO, запись в PostgreSQL; `GET /api/markers`, `GET /api/markers/{id}`; изменение — с авторизацией | `ARBook-backend.Api/Controllers/MarkersController.cs`, `Storage/S3Storage.cs`, `Shared/Data/ArDbContext.cs` |
| 6 | Объединённый `.mind` для клиента | Загрузка каждого `.mind` из хранилища, разбор MessagePack (`ExtractDataListItems`), сборка `BuildCombinedMindFile` | `MarkersController.cs` |
| 7 | Интерфейс: выбор модели, запуск/остановка AR, ошибки | Запуск/остановка: кнопка старта, `dispose` при размонтировании. Ошибки: сообщения, режим «только камера» при сбое. Выбор модели из списка до сессии не реализован — выбор фактический по наводимому маркеру | `src/views/ArView.vue`, `src/composables/useCameraFallback.ts` |
| 8 | Журналирование | Клиент: `logger` (активен в dev). Сервер: Serilog; после ответа — `ApiStatisticsMiddleware` → запись в `ApiStatistics`. Отдельный журнал потери трекинга не ведётся | `src/utils/logger.ts`, `src/composables/useArScene.ts`; бэкенд: `ApiStatisticsMiddleware.cs`, `ApiStatisticsService.cs`, `Program.cs` |

Примечание — Интерактивное масштабирование и свободный перенос модели в AR жестами, выбор модели из списка до запуска камеры, журналирование клиентских событий в production и событий потери трекинга на сервере обеспечиваются частично или не реализованы; доработка может быть отнесена к этапам развития системы.

## 1.1.1.2 Графические материалы

Таблица 1.2 — Файлы диаграмм (draw.io)

| № п/п | Файл | Содержание |
|:-----:|------|------------|
| 1 | `docs/ARBook-lab-diagrams.drawio` | Клиент: архитектура, классы, блок-схема / деятельность / последовательность — ленивая загрузка GLB |
| 2 | `docs/ARBook-backend-lab-diagrams.drawio` | Сервер: архитектура, классы, алгоритм `combined-mind`, последовательность, схема БД |
| 3 | `docs/ARBook-database-schema.drawio` | Таблицы PostgreSQL |

## 1.1.1.3 Выводы по подразделу

Функциональные требования обеспечиваются клиентом (Vue 3, MindAR, Three.js) и сервером (ASP.NET Core, EF Core, PostgreSQL, S3-совместимое хранилище). Неполное покрытие отдельных формулировок ТЗ отражено в примечании к таблице 1.1.
