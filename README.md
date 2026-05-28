# Дворец горняков — Сатпаев

[![CI](https://img.shields.io/github/actions/workflow/status/m34959203/dvorets-gornyakov/ci.yml?branch=master)](https://github.com/m34959203/dvorets-gornyakov/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Stack](https://img.shields.io/badge/stack-Next.js%2016%20·%20React%2019%20·%20Postgres-black)]()

> Двуязычный (kk/ru) сайт КГКП «Центр культуры и творчества им. Ш. Дильдебаева»
> (Дворец горняков, г. Сатпаев): аренда залов, кружки, события, новости,
> онлайн-запись, AI-помощник и админ-CMS.

## Проблема

У дворца культуры не было современного сайта: расписание кружков и афиша
жили в соцсетях, заявки на аренду залов и запись в кружки шли вручную через
звонки, контент дублировался на двух языках без единой системы.

## Решение

Единый портал с публичной частью (kk/ru) и админ-CMS из 17 разделов:
онлайн-запись в кружки, заявки на аренду залов с календарём занятости,
AI-чат-бот и квиз для подбора кружка, авто-публикация новостей и событий
в Telegram/Instagram, аналитика посещаемости.

## Why this stack

- **Next.js 16 (App Router) + React 19** — SSR/RSC для SEO публичных страниц и быстрая админка в одном приложении.
- **PostgreSQL + raw SQL (`pg`)** — без ORM: прозрачные параметризованные запросы, двуязычные поля `*_kk` / `*_ru`.
- **Gemini 2.0 Flash с kill-switch** — AI-чат и бот аренды на бесплатном тарифе; `AI_DISABLED=1` гарантирует $0 при простое.
- **JWT (jose) + Argon2 + RBAC** — роли `admin` / `editor`, httpOnly-cookie, без внешнего auth-провайдера.

## Demo

- Live: временный trycloudflare-туннель (по запросу); постоянный `.kz`-домен в работе.
- Локально: `http://localhost:3013/kk`
- Скриншоты: `assets/` (TODO)

## Архитектура

```
src/app/[locale]/(public)/   публичные страницы (hero, rent, clubs, events, news, about, …)
src/app/[locale]/(admin)/    админ-CMS (17 разделов, RBAC admin/editor)
src/app/api/                 REST-эндпоинты (Zod-валидация, JWT-cookie)
src/components/{ui,features}/ переиспользуемый UI / доменные компоненты
src/lib/                     db (pg), auth (jose+argon2), gemini, i18n
sql/                         миграции БД (порядковая нумерация)
```

Подробнее — в [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md),
[`docs/API.md`](docs/API.md), [`docs/DATABASE.md`](docs/DATABASE.md),
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Quick Start

```bash
git clone https://github.com/m34959203/dvorets-gornyakov.git
cd dvorets-gornyakov
cp .env.example .env.local                    # минимум: DATABASE_URL, JWT_SECRET
docker compose up -d postgres                 # Postgres на хост-порту 5443
for f in sql/*.sql; do
  docker exec -i dvorets-gornyakov-postgres-1 psql -U dvorets -d dvorets_db < "$f"
done
npx tsx scripts/create-admin.ts admin@dvorets.kz password123 "Admin"
npx tsx scripts/seed.ts
npm run dev                                    # http://localhost:3013/kk
```

Публичка — `/kk` (и `/ru`), админка — `/kk/admin`.

## Roadmap

- [x] Публичная часть (kk/ru): кружки, события, новости, аренда залов
- [x] Админ-CMS (17 разделов), RBAC admin/editor, тосты + ConfirmDialog
- [x] AI-чат-бот и квиз подбора кружка (Gemini + kill-switch)
- [x] Авто-публикация новостей/событий в Telegram/Instagram
- [x] Редизайн (chiaroscuro по всем страницам)
- [ ] Календарь занятости залов на `/rent` (P2)
- [ ] Бот аренды зала через function calling (`docs/rent-bot.md`)
- [ ] Постоянный `.kz`-домен + продакшен-деплой

## Лицензия

[MIT](LICENSE) · © 2026 m34959203 / КГКП «Центр культуры и творчества им. Ш. Дильдебаева»
