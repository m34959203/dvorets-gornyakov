# NOTES — dvorets-gornyakov

Живой документ для сохранения контекста между сессиями. Обновлять на ходу; не стирать историю без причины.

**Репо:** https://github.com/m34959203/dvorets-gornyakov
**Бранч:** `master`
**Стек:** Next.js 16 (Turbopack, App Router) · React 19 · TS 5 · Tailwind 4 · PostgreSQL 16 (raw SQL через `pg`) · JWT (jose) + Argon2 · Google Gemini · Docker Compose + Caddy.

---

## Быстрый старт

```bash
cd /home/ubuntu/dvorets-gornyakov
docker compose up -d postgres          # поднять БД
psql -h localhost -U dvorets dvorets_db -f sql/001_init.sql
psql -h localhost -U dvorets dvorets_db -f sql/002_rent.sql
npx tsx scripts/create-admin.ts admin@dvorets.kz password123 "Admin"
npx tsx scripts/seed.ts
cp .env.example .env.local             # отредактировать
npx next dev -p 3013
```

Открыть: `http://localhost:3013/ru` (публичка) · `http://localhost:3013/ru/admin` (админка).

Порты 3000-3012 заняты другими проектами на этой машине — стабильно свободен `3013`.

---

## Карта модулей

### Публичные страницы
- `/[locale]` — главная (hero + чек-лист аренды + события + кружки + новости)
- `/[locale]/rent` — аренда залов (hero, карточки, календарь, FAQ, форма)
- `/[locale]/rent/[slug]` — детальная зала (галерея, JSON-LD EventVenue, мини-календарь)
- `/[locale]/{news,clubs,events,about,contacts,resources,rules}` — стандартные разделы

### Админка `/[locale]/admin/*`
Паттерн везде один: список + drawer с формой + фильтры. Реальный fetch, без мок-данных.

| Раздел | Особенность |
|---|---|
| `news` | publish workflow: draft→published→archived, auto `published_at` |
| `events` | status cycle, datetime-local, фильтр по типу |
| `clubs` | schedule как JSON, toggle `is_active`, защита от удаления с enrollments |
| `banners` | reorder через `sort_order` ±10, `is_active` toggle |
| `enrollments` | одобрение/отклонение заявок в кружки |
| `users` | argon2, self-demotion/self-delete guards, 409 при FK |
| `settings` | k-v с группами + custom ключи, bulk PUT в транзакции |
| `chatbot` | KB для Gemini — категории + bilingual Q/A |
| `rent/requests` | заявки на аренду, статусы, drawer |
| `rent/halls` | CRUD залов (slug, фото, оборудование) |

### API
- Публичные GET: `/api/{news,events,clubs,banners,rent/halls,rent/availability}`
- Публичные POST: `/api/clubs/enroll` (rate-limit 3/ч/IP), `/api/rent/request` (rate-limit + honeypot + Telegram)
- Авторские POST: `/api/{news,events,clubs,banners}` (admin/editor)
- `[id]` CRUD: `/api/{news,events,clubs,banners,rent/halls,rent/requests}/[id]`
- Админ-списки: `/api/admin/{news,events,clubs,banners,enrollments,users,settings,chatbot-kb}`
- Контракт: `{ data: ... }` / `{ error: "..." }`. Zod в `src/lib/validators.ts`.

---

## База данных

Миграции в `sql/`, нумерация последовательная:
- `001_init.sql` — users, news, clubs, enrollments, events, banners, pages, chatbot_knowledge, site_settings, media
- `002_rent.sql` — halls, rental_requests, view `hall_busy_days`, partial unique `uniq_confirmed_booking`

Добавлять только новые файлы с инкрементом номера, не править существующие.

Все двуязычные поля: `_kk`/`_ru`. Расписание — JSONB. UUID-первичные ключи. В админке никогда не возвращаем `password_hash` (см. `/api/admin/users/route.ts`).

---

## Конвенции кода

- Server Components по умолчанию; `"use client"` только где нужен state.
- Tailwind 4, цвета: `bg-primary` (`#0d7377`), `bg-accent` (`#d4a843`), `bg-primary-dark` (`#095456`). Без CSS-модулей.
- Админ-страницы используют общий паттерн drawer+table из `src/app/[locale]/(admin)/admin/rent/requests/page.tsx`.
- Формы — эталон `src/components/rent/HallForm.tsx`.
- RBAC в админ-API: `requireRole(user, ["admin","editor"])`, для удалений — `["admin"]`. Всегда try/catch → 500 вместо падения.
- Валидация: `parseBody(schema, body)` из `src/lib/validators.ts`, никогда не строковая конкатенация SQL.
- i18n: строки в `src/messages/{ru,kk}.json`. Для тактических меток в админке допустим inline `locale === "kk" ? "..." : "..."`.
- Upload: `POST /api/upload` FormData `file` → `{ data: { url } }`.

---

## Публичная аренда залов (модуль `rent`)

Тех-задание: `docs/RENT-MODULE-SPEC.md`. Живёт отдельно от этого NOTES.

**Сидированные залы:** `grand` (650), `chamber` (120), `rehearsal` (40). Цены-заглушки, менять через `/admin/rent/halls` или SQL.

**Уведомления:** Telegram-бот (переменные `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHANNEL_ID`). Email пока не включён — см. «Открытые вопросы».

**Анти-спам:** rate-limit 3/ч/IP + honeypot-поле `website`. reCAPTCHA не подключена.

---

## Hero + чек-лист (главная)

Фон hero — `/hero/hero.jpg` + градиент-fallback. Если файла нет, показывается только градиент с казахским орнаментом.

Куда класть экспорт из PSD: `public/hero/README.txt` содержит список требуемых имён (`hero.jpg`, `hall-grand-1.jpg`, `hall-chamber-1.jpg`, `hall-rehearsal-1.jpg`, рекомендуемые размеры).

---

## Деплой

В репо лежат `Dockerfile` + `docker-compose.yml` + `caddy/Caddyfile`. Prod домен по ТЗ — `dvorets-gornyakov.kz` (Caddy проксирует на Next).

**⚠️ Не коммитить** локальные правки `caddy/Caddyfile` и `docker-compose.yml` из этой машины — там остались куски конфигов других проектов (technokod, порт 3007). Всегда проверять `git diff` перед add.

---

## История крупных коммитов

| Commit | Что |
|---|---|
| `2859168` | feat: hero первого экрана + чек-лист аренды (в стиле almaty-ayenderi.kz) |
| `c00e2ef` | docs: ТЗ модуля «Аренда залов» v0.1 |
| `14f3be3` | feat(rent): модуль «Аренда залов» v1 — БД, API, публичные страницы, админка |
| `568be05` | feat(admin): полноценная админ-панель для всех ресурсов с публикацией |

---

## Открытые вопросы (ждём заказчика)

1. **Финальные цены** и перечень оснащения каждого зала — сейчас сид-заглушки.
2. **SMTP** для email-уведомлений — пока только Telegram. Если нужен email — добавить `src/lib/mail.ts` и `.env` с SMTP_* (hoster.kz реквизиты).
3. **reCAPTCHA v3** или достаточно honeypot+rate-limit?
4. **Интеграция с 1С/CRM** — если нужна, формат (CSV/webhook)?
5. **Фото залов из PSD** — выложить в `public/hero/` по именам из `public/hero/README.txt`.
6. **Модератор заявок** — один админ или несколько editor-ов? (RBAC уже готов к обоим вариантам.)

---

## Known issues / TODO

- Next 16 просит переименовать `src/middleware.ts` → `src/proxy.ts` (deprecation warning).
- `serverActions` помечен экспериментальным в `next.config.ts` — при переходе на stable API убрать флаг.
- Cross-origin warning в dev при обращении с `192.168.50.13` — для внутренней разработки можно добавить `allowedDevOrigins` в next.config.
- Sitemap/robots.txt — не сгенерированы. Добавить `src/app/sitemap.ts` и `src/app/robots.ts`.
- OpenGraph-image для hero — использовать `next/og` когда будет готов фото из PSD.
- Тестов нет (unit/e2e). Для v2 — Vitest + pg test-db, E2E формы `/rent/request`.

---

## Полезные файлы в репо

- `CLAUDE.md` — developer guide для Claude/людей.
- `docs/RENT-MODULE-SPEC.md` — ТЗ аренды v0.1.
- `docs/PRD.md`, `docs/PAGES.md`, `docs/API-SPEC.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/DEVELOPMENT.md`, `docs/GEMINI-LIMITS.md` — подробная документация.
- `sql/001_init.sql`, `sql/002_rent.sql` — миграции.
- `scripts/create-admin.ts`, `scripts/seed.ts` — CLI-утилиты.

---

*Обновлять этот файл по ходу работы — добавлять крупные решения, открытые вопросы, особенности деплоя.*
