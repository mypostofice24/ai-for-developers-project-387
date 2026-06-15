# AGENTS.md

## Project Context

This is a учебный проект календарного бронирования и продолжение завершенного
проекта `ai-for-developers-project-386`. В этом репозитории приложение уже
перенесено, а основной фокус - командный цикл разработки с агентом в GitHub:
issue, triage, pull request, review-доработки и scheduled checks.

API-контракт остается источником правды для фронтенда и бэкенда.

Основной контракт:

- TypeSpec: `spec/main.tsp`
- Описание домена и покрытия сценариев: `docs/api-contract.md`
- Генерация OpenAPI: `npm run compile:spec`
- Генерация frontend-типов: `npm run generate:web-types`
- Mock API по контракту: `npm run mock:api`

## Stack

Фронтенд реализуется как отдельная часть приложения.

Выбранный frontend stack:

- Nuxt 4
- Vue 3
- TypeScript
- Nuxt UI
- REST composables для работы с API
- API base через env-переменную, например `NUXT_PUBLIC_API_BASE`
- generated TypeScript types from OpenAPI через `openapi-typescript`

Dev defaults:

- frontend: `http://localhost:3000`
- API backend: `http://localhost:3001`
- API mock по контракту: `http://localhost:4010`
- если порт занят, временно использовать `WEB_PORT` или `MOCK_API_PORT`

Выбранный backend stack:

- NestJS
- Fastify
- TypeScript
- in-memory storage
- generated TypeScript types from OpenAPI через `openapi-typescript`

Не добавлять без отдельного решения:

- `/api/v1` prefix
- Pinia, если нет сложного состояния
- auth
- SSE
- Redis, BullMQ, PostgreSQL, Prisma
- новую продуктовую функциональность вне GitHub issue/PR процесса

## API Usage Rules

Фронтенд должен работать только через API по контракту:

- `GET /event-types`
- `GET /event-types/{eventTypeId}/slots`
- `POST /bookings`
- `GET /admin/event-types`
- `POST /admin/event-types`
- `GET /admin/bookings`

Не добавлять новые endpoints и не менять wire-format без предварительного
обновления TypeSpec-контракта.

Если UI или backend требует новое поле, endpoint или статус ответа, сначала
обновить `spec/main.tsp`, затем выполнить:

- `npm run compile:spec`
- `npm run generate:web-types`

Prism используется как контрактный mock server, а не как stateful backend.
Основная реализация API находится в `backend/`.

## GitHub Workflow Focus

Для этого продолжения важны артефакты командного процесса:

- issue с постановкой задачи;
- triage/анализ задачи агентом в комментариях;
- pull request с правками агента;
- review feedback и доработки;
- scheduled workflow с регулярной проверкой.

План задач для будущих issue хранится в `docs/development-plan.md`.

## Documentation Language

Идентификаторы API, URL, имена моделей, поля и error codes остаются на
английском. Человекочитаемая документация и пояснения могут быть на русском.
