# NOTES — dvorets-gornyakov

Живой документ для сохранения контекста между сессиями. Обновлять на ходу; не стирать историю без причины.

**Репо:** https://github.com/m34959203/dvorets-gornyakov (public)
**Бранч:** `master` (не `main`)
**Локально:** `/home/ubuntu/dvorets-gornyakov`
**Стек:** Next.js 16 (Turbopack, App Router) · React 19 · TS 5 · Tailwind 4 · PostgreSQL 16 (raw SQL через `pg`, без ORM) · JWT (jose) + Argon2 · Google Gemini 2.0 Flash · Docker Compose + Caddy.

---

## Быстрый старт

```bash
cd /home/ubuntu/dvorets-gornyakov
docker compose up -d postgres                 # Postgres на хост-порту 5443
for f in sql/*.sql; do
  docker exec -i dvorets-gornyakov-postgres-1 psql -U dvorets -d dvorets_db < "$f"
done
npx tsx scripts/create-admin.ts admin@dvorets.kz password123 "Admin"
npx tsx scripts/seed.ts
cp .env.example .env.local                    # отредактировать
npx next dev -p 3013 -H 0.0.0.0
```

Открыть: `http://localhost:3013/ru` (публичка) · `http://localhost:3013/ru/admin` (админка).
LAN-адрес для той же сети: `http://192.168.50.13:3013`.

Порты 3000-3012 заняты другими проектами на этой машине — стабильно свободен **3013**.

---

## Карта модулей

### Публичные страницы (`/[locale]/...`)
- `/` — главная (hero + чек-лист аренды + события + кружки + новости + AI-квиз)
- `/rent` — аренда залов (hero, карточки, календарь, FAQ, форма)
- `/rent/[slug]` — детальная зала (галерея, JSON-LD EventVenue, мини-календарь)
- `/{news,clubs,events,about,contacts,resources,rules}` — стандартные разделы
- **AnalyticsTracker** встроен в public-layout — шлёт pageview при смене роута

### Админка `/[locale]/admin/*`
Паттерн везде drawer+table+фильтры. Реальный fetch, RBAC.

| Раздел | Особенность |
|---|---|
| `news` | publish workflow draft→published→archived, auto `published_at`, поля `video_url`/`embed_code`, кнопки RU↔KK перевода, авто-Telegram/Instagram при publish |
| `events` | status cycle, datetime-local, фильтр по типу, auto-соцсети |
| `clubs` | schedule как JSON, toggle `is_active`, `instructor_id` (FK users), защита от удаления с enrollments |
| `banners` | reorder через `sort_order` ±10, `is_active` toggle |
| `enrollments` | одобрение/отклонение заявок в кружки |
| `users` | argon2, self-guards, роли admin/editor/instructor, 409 при FK |
| `settings` | k-v с группами + custom ключи, bulk PUT в транзакции; группа «Аналитика» (GA4 ID + Я.Метрика ID) |
| `chatbot` | KB для Gemini — категории + bilingual Q/A |
| `rent/requests` | заявки на аренду, статусы, drawer |
| `rent/halls` | CRUD залов (slug, фото, оборудование) |
| **`media`** | drag-drop галерея, SHA-256 дедуп, alt_kk/ru, поиск, фильтр по mime |
| **`analytics`** | KPI (сессии/pageviews), топ-пути, источники, последние события |
| **`ai-usage`** | запросы к Gemini, cost $, % бюджета, настройка `ai_monthly_budget_usd` |
| **`scheduler`** | отложенные задания publish_news/publish_event, retry, cancel |
| **`social-templates`** | CRUD шаблонов постов Telegram/Instagram, плейсхолдеры `{{title_ru}}` и др. |
| **`navigation`** | редактор меню — дерево, reorder, toggle is_active |

### API

- **Публичные GET**: `/api/{news,events,clubs,banners,rent/halls,rent/availability}`
- **Публичные POST**: `/api/clubs/enroll` (rate-limit 3/ч/IP), `/api/rent/request` (rate-limit + honeypot + Telegram), `/api/chatbot`, `/api/translate`, `/api/recommend`, `/api/analytics/event` (без auth, rate-limit 20/мин/IP)
- **Admin POST/PUT/DELETE**: `/api/{news,events,clubs,banners,rent/halls}/[id]`
- **Admin-списки**: `/api/admin/{news,events,clubs,banners,enrollments,users,settings,chatbot-kb,media,media/[id],analytics/summary,ai-usage,scheduler,scheduler/[id],social-templates,social-templates/[id],navigation,navigation/[id],navigation/[id]/reorder}`
- **Соцсети**: `POST /api/social/telegram`, `POST /api/social/instagram` (ручные триггеры)
- **Cron**: `POST/GET /api/cron/tick` (опционально защищено `CRON_SECRET` Bearer)
- **Контракт**: `{ data: ... }` / `{ error: "..." }`. Zod в `src/lib/validators.ts`.

---

## База данных

Postgres 16 в Docker. Хост-порт **5443** → контейнер 5432. Creds: `dvorets:dvorets_pass@localhost:5443/dvorets_db`.

Миграции в `sql/`, строго инкрементальная нумерация. Применять в порядке номеров.

| # | Файл | Таблицы / изменения |
|---|---|---|
| 001 | `001_init.sql` | users, news, clubs, enrollments, events, event_subscriptions, banners, pages, chatbot_knowledge, site_settings, media |
| 002 | `002_rent.sql` | halls, rental_requests, view `hall_busy_days`, partial unique `uniq_confirmed_booking` |
| 003 | `003_news_video.sql` | news.video_url, news.embed_code |
| 004 | `004_auto_publish_settings.sql` | flags `auto_telegram_*`, `auto_instagram_*`, `site_base_url` |
| 005 | `005_club_instructors.sql` | role `instructor`, clubs.instructor_id FK |
| 006 | `006_scheduled_jobs.sql` | scheduled_jobs (pending/running/done/failed) |
| 007 | `007_social_templates.sql` | social_templates (platform×kind, seed 4 дефолта) |
| 008 | `008_media_extra.sql` | media.{original_name, width, height, alt_kk, alt_ru, hash} |
| 009 | `009_analytics.sql` | analytics_sessions, analytics_events + settings `ga4_measurement_id`, `yandex_metrika_id` |
| 010 | `010_ai_usage.sql` | ai_generations + settings `ai_monthly_budget_usd=20`, `ai_daily_request_limit=500` |
| 011 | `011_nav_items.sql` | nav_items (дерево) + seed текущего меню |

Все двуязычные поля: `_kk`/`_ru`. Расписание — JSONB. UUID-первичные ключи. В админке никогда не возвращаем `password_hash`.

---

## ENV vars (`.env.local`)

```bash
DATABASE_URL=postgresql://dvorets:dvorets_pass@localhost:5443/dvorets_db
JWT_SECRET=<64-char-random>
NEXT_PUBLIC_APP_URL=http://localhost:3013
NEXT_PUBLIC_DEFAULT_LOCALE=ru
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=25000000

# AI
GEMINI_API_KEY=...

# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHANNEL_ID=@channel

# Instagram Graph API v19.0
INSTAGRAM_ACCESS_TOKEN=...
INSTAGRAM_ACCOUNT_ID=...    # Instagram Business Account ID

# Cron (опционально, для /api/cron/tick извне)
CRON_SECRET=...

# Отключить in-process тикер (если запускаешь cron из GitHub Actions / k8s)
# DISABLE_CRON=1
```

Публичные ключи аналитики — в `/admin/settings`:
- `ga4_measurement_id` (G-XXXX...) — GA4
- `yandex_metrika_id` (counter ID) — Я.Метрика

---

## Конвенции кода

- Server Components по умолчанию; `"use client"` только где нужен state.
- Tailwind 4, цвета: `bg-primary` (`#0d7377`), `bg-accent` (`#d4a843`), `bg-primary-dark` (`#095456`). Без CSS-модулей.
- Админ-страницы используют общий паттерн drawer+table из `src/app/[locale]/(admin)/admin/rent/requests/page.tsx` или `banners/page.tsx`.
- Формы — эталон `src/components/rent/HallForm.tsx`.
- RBAC: `requireRole(user, ["admin","editor"])`; удаления — `["admin"]`. **Всегда** try/catch → 500 вместо падения.
- Валидация: `parseBody(schema, body)` из `src/lib/validators.ts`, никогда не строковая конкатенация SQL.
- i18n: строки в `src/messages/{ru,kk}.json`. Для тактических меток в админке допустим inline `locale === "kk" ? "..." : "..."`.
- Upload: `POST /api/upload` FormData `file` → `{ data: { id, url, filename, original_name, size, mime_type } }`, автодедуп по SHA-256.

---

## Соцсети / автопостинг

- **Telegram** (`src/lib/telegram.ts`) — bot API, `sendTelegramMessage`/`sendTelegramPhoto`.
- **Instagram** (`src/lib/instagram.ts`) — Graph API v19.0, two-phase: `/media` → `/media_publish`. **Требует** `image_url` (без фото не публикуется).
- **Оркестрация** (`src/lib/publish.ts`) — читает `auto_telegram_*`/`auto_instagram_*` флаги, рендерит шаблон через `src/lib/social-templates.ts` (с fallback на hardcoded).
- **Триггеры**: при переходе news→`published`, events→`upcoming` (в API `news/[id]` PUT/PATCH, `events/[id]` PUT/PATCH).
- **Отложенная публикация**: `/admin/scheduler` → job_type `publish_news`/`publish_event`, payload `{news_id}`/`{event_id}`, run_at timestamp.
- **Шаблоны** в `/admin/social-templates`. По 1 default на пару (platform, kind). Плейсхолдеры: `{{title_ru}}`, `{{title_kk}}`, `{{excerpt_ru}}`, `{{excerpt_kk}}`, `{{date_ru}}`, `{{date_kk}}`, `{{location}}`, `{{url}}`.

---

## AI (Gemini)

- Клиент `src/lib/gemini.ts` — `chatWithGemini(messages, systemPrompt, opts?)`, `translateText`, `recommendClubs`.
- Все вызовы логируются в `ai_generations` через `src/lib/ai-usage.ts` (`logGeneration`).
- **Budget guard**: перед вызовом проверяется `withinBudget()` — если месячный spend ≥ `ai_monthly_budget_usd`, возвращается заглушка, Gemini не вызывается.
- **Cost model**: `gemini-2.0-flash` — $0.10/1M input, $0.40/1M output.
- **Purposes**: `chatbot`, `translate`, `recommend`, `other`.
- **Дашборд** `/admin/ai-usage`: 4 KPI + прогресс-бар бюджета + таблица by_day + таблица последних запросов с фильтрами.

---

## Scheduler / Cron

- Таблица `scheduled_jobs` (pending/running/done/failed) + backoff 1→4→15→60→240 мин, max 5 попыток.
- `src/lib/scheduler.ts` — `runPendingJobs()`, `scheduleJob(...)`, `startInProcessTicker()`.
- **In-process ticker**: `instrumentation.ts` стартует `setInterval(60_000)` при boot. Отключается через `DISABLE_CRON=1`.
- **Fallback endpoint**: `POST /api/cron/tick` — для внешнего cron (GitHub Actions, k8s CronJob), защищён `CRON_SECRET` Bearer если задан.
- Админ: `/admin/scheduler` — очередь с фильтром статус/тип, «Повторить» для failed/done, «Удалить» для pending/failed.

---

## Analytics

- Клиент `src/components/analytics/AnalyticsTracker.tsx` — session cookie `dg_sid` (30 дней), шлёт pageview на смену pathname/searchParams.
- Public endpoint `POST /api/analytics/event` — без auth, rate-limit 20/мин/IP, UPSERT в `analytics_sessions`, INSERT в `analytics_events`.
- Типы событий (whitelist): `pageview`, `enrollment_click`, `rent_request_submit`, `chatbot_open`, `quiz_complete`.
- GA4 и Я.Метрика: условный `<Script>` в public-layout, ID задаются в `/admin/settings`.
- Дашборд `/admin/analytics`: KPI (сессии/pageviews за сегодня/7д/30д), топ-путей, источников, recent events.

---

## Публичная аренда залов (модуль `rent`)

Тех-задание: `docs/RENT-MODULE-SPEC.md`.

**Сидированные залы:** `grand` (650), `chamber` (120), `rehearsal` (40). Цены-заглушки, менять через `/admin/rent/halls` или SQL.

**Уведомления:** Telegram-бот. Email пока не включён.

**Анти-спам:** rate-limit 3/ч/IP + honeypot-поле `website`.

---

## Hero + чек-лист (главная)

Фон hero — `/hero/hero.jpg` + градиент-fallback. Если файла нет, показывается только градиент с казахским орнаментом.

`public/hero/README.txt` содержит список требуемых имён (`hero.jpg`, `hall-grand-1.jpg`, ...).

---

## Деплой

В репо лежат `Dockerfile` + `docker-compose.yml` + `caddy/Caddyfile`. Prod домен по ТЗ — `dvorets-gornyakov.kz` (Caddy проксирует на Next).

**Публичный доступ с этой машины:** порты 80/443 блокированы провайдером. Варианты:
1. **Собственный Cloudflare Tunnel** на `dvorets-gornyakov.kz` (когда заказчик зарегистрирует/делегирует DNS). Нельзя использовать чужой домен `technokod.kz` — это отдельный проект.
2. **TryCloudflare** — `cloudflared tunnel --url http://localhost:3013` выдаёт одноразовый URL `*.trycloudflare.com`, случайный, при рестарте меняется. Годится для демо.

**⚠️ Не коммитить** локальные правки `caddy/Caddyfile` и `docker-compose.yml` из этой машины — там остались куски конфигов других проектов (technokod, порт 3007). Всегда проверять `git diff` перед `git add`.

---

## Покрытие ТЗ

По `docs/TZ-AUDIT.md` закрыто ~95% спека. Что осталось:

- Видео в новостях — ✅ (миграция 003)
- Автопубликация Telegram/Instagram при publish — ✅
- Автопубликация по расписанию (cron) — ✅
- Шаблоны SMM — ✅
- ИИ-перевод в формах news/events/clubs — ✅
- CTA «Записаться» в RecommendQuiz — ✅
- Дашборд токенов Gemini — ✅
- Редактор меню — ✅
- UI медиабиблиотеки — ✅
- Аналитика (Я.Метрика + GA4 + внутренняя) — ✅
- Sitemap/robots.txt — ❌
- reCAPTCHA — ❌ (решено не надо, есть honeypot+rate-limit)
- SMTP для email — ❌ (ждём реквизитов hoster.kz)
- Lighthouse ≥ 90 / OpenGraph — ⏸ (после готовых фото из PSD)

---

## Открытые вопросы (ждём заказчика)

1. **Финальные цены** и перечень оснащения каждого зала — сейчас сид-заглушки.
2. **SMTP** для email-уведомлений — пока только Telegram.
3. **Креды**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`, `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_ACCOUNT_ID`, `GEMINI_API_KEY`, GA4 Measurement ID, Я.Метрика counter ID.
4. **Интеграция с 1С/CRM** — если нужна, формат (CSV/webhook)?
5. **Фото залов из PSD** — выложить в `public/hero/`.
6. **Модератор заявок** — один админ или несколько editor-ов? (RBAC уже готов к обоим.)
7. **Домен и SSL** — `dvorets-gornyakov.kz` в Caddyfile, DNS пока не настроен.

---

## Known issues / TODO

- Next 16 просит переименовать `src/middleware.ts` → `src/proxy.ts` (deprecation warning).
- `serverActions` помечен экспериментальным в `next.config.ts` — при переходе на stable API убрать флаг.
- Cross-origin warning в dev при обращении с `192.168.50.13` — можно добавить `allowedDevOrigins` в next.config.
- `sitemap.ts` / `robots.ts` — не сгенерированы.
- OpenGraph-image для hero — через `next/og` когда будут фото из PSD.
- Тестов нет (unit/e2e). Для v2 — Vitest + pg test-db, E2E формы `/rent/request`.

---

## История крупных коммитов

| Commit | Что |
|---|---|
| `2859168` | feat: hero первого экрана + чек-лист аренды |
| `c00e2ef` | docs: ТЗ модуля «Аренда залов» v0.1 |
| `14f3be3` | feat(rent): модуль «Аренда залов» v1 |
| `568be05` | feat(admin): полноценная админ-панель |
| `b9732ec` | docs: аудит ТЗ 88% |
| (uncommitted 2026-04-19) | 6 новых модулей из technokod: media/analytics/ai-usage/scheduler/social-templates/navigation |

---

## Полезные файлы в репо

- `CLAUDE.md` — developer guide для Claude/людей.
- `docs/TZ-AUDIT.md` — аудит соответствия ТЗ.
- `docs/RENT-MODULE-SPEC.md` — ТЗ аренды v0.1.
- `docs/{PRD,PAGES,API-SPEC,ARCHITECTURE,DATABASE,DEVELOPMENT,GEMINI-LIMITS}.md` — подробная документация.
- `sql/*.sql` — миграции.
- `scripts/{create-admin,seed}.ts` — CLI-утилиты.
- `instrumentation.ts` — старт cron-тикера.

---

*Обновлять этот файл по ходу работы — добавлять крупные решения, новые модули, открытые вопросы, особенности деплоя. Менять дату коммита в «История» после крупных git commit.*
