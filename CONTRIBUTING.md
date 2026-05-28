# Contributing

## Окружение

```bash
npm install
cp .env.example .env.local        # минимум: DATABASE_URL, JWT_SECRET
docker compose up -d postgres     # Postgres на хост-порту 5443
for f in sql/*.sql; do docker exec -i dvorets-gornyakov-postgres-1 psql -U dvorets -d dvorets_db < "$f"; done
npx tsx scripts/create-admin.ts admin@dvorets.kz password123 "Admin"
npx tsx scripts/seed.ts
npm run dev                       # http://localhost:3013/kk
```

Без `GEMINI_API_KEY` (или при `AI_DISABLED=1`) чат-бот отвечает дружелюбным
fallback без 500 — это штатный режим для низкоприоритетного AI.

## Стандарты кода

- **TypeScript strict**, без `any`. Интерфейсы для всех props.
- **Server Components by default**; `"use client"` только для интерактива (формы, drawer, чат).
- **i18n.** Любой UI-текст — в `src/messages/{kk,ru}.json`; контент в БД — пары `field_kk` / `field_ru`. Локализованное значение — через `getLocalizedField(item, "field", locale)`.
- **Tailwind 4** для стилей, без CSS-модулей.
- **БД** — только параметризованный raw SQL через `pg` (`src/lib/db.ts`), без ORM и без конкатенации строк.
- Картинки — `next/image`, не `<img>`.
- **AI** — только через `src/lib/gemini.ts`. Бюджет: `maxOutputTokens=1024`, graceful fallback при отсутствии ключа/превышении квоты.

## Новая страница

1. `src/app/[locale]/(public)/<page>/page.tsx`.
2. Тексты в `src/messages/{kk,ru}.json`.
3. Линк в `Header.tsx` или через CMS-меню.

## Новый API-эндпоинт

1. `src/app/api/<endpoint>/route.ts`.
2. **Валидация:** Zod-схема для всех входных данных.
3. **Auth:** JWT в httpOnly-cookie; admin-мутации — RBAC `["admin","editor"]` + `try/catch AuthError` (иначе 500).
4. Формат ответа: `{ data: ... }` или `{ error: "message" }`.
5. Документировать в [`docs/API.md`](docs/API.md).

## Новая миграция

1. `sql/0NN_<name>.sql` с порядковым номером. Идемпотентно (`IF NOT EXISTS`, `ON CONFLICT`).
2. Описать в [`docs/DATABASE.md`](docs/DATABASE.md).
3. Прогнать локально на dev-БД до коммита.

## Conventional Commits на русском

Английский префикс + русское описание, инфинитив, ≤72 символа, без точки. Тело отделять пустой строкой, объяснять «зачем».

| Префикс | Когда |
|---|---|
| `feat:` | Новая функциональность |
| `fix:` | Исправление бага |
| `docs:` | Только документация |
| `refactor:` | Рефакторинг без изменения поведения |
| `chore:` | Зависимости, конфиги |
| `ci:` | GitHub Actions |
| `perf:` | Оптимизация |
| `test:` | Тесты |
| `style:` | Форматирование |

Примеры:
- `feat(rent): календарь занятости залов на /rent`
- `fix(api): GET /api/news/[id] 500 — каст id::text в WHERE`
- `docs(database): миграция 012_real_org_data`
- `chore(deps): обновить next до 16.2.2`

Не использовать `--no-verify` без согласования.

## Pull Request / Issues

- На русском, по шаблонам `.github/PULL_REQUEST_TEMPLATE.md` и `.github/ISSUE_TEMPLATE/{bug,feature}.md`.
- Self-review до запроса ревью. Чеклист в шаблоне PR обязателен.
- Перед открытием: `npm run lint` и `npm run build` — чистые.

## Безопасность

- Не коммитить `.env*` (`.env.example` — только плейсхолдеры).
- При утечке секрета **немедленно ротировать** ключ (Gemini / Telegram / Instagram); удаления коммита недостаточно.
- SQL — всегда параметризованные запросы, никогда конкатенация.
- JWT в `httpOnly + Secure + sameSite` cookie; секрет из env.
- Rate-limit на публичных формах (запись в кружки — 3/час/IP).
- `git remote` без токенов в URL (push через `gh` или SSH).
