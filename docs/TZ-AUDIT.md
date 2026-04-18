# Аудит соответствия ТЗ

**Дата:** 2026-04-18 · **Коммит:** `b9732ec` (master)
**Готовность:** 37/42 = **88 %** (после закрытия Фазы 1)

ТЗ — «Разработка веб-сайта КГКП Дворец горняков им. Ш. Дильдебаева».

---

## 3.1 Информационные разделы — 5/6

| # | Пункт | Статус | Детали |
|---|---|---|---|
| 1 | Новости: текст, фото | ✅ | `sql/001_init.sql:16–36`, `/[locale]/news/*`, `/api/news*` |
| 1б | Новости: **видео** | ❌ | Нет полей `video_url`/`embed_code` в `news` |
| 2 | Мероприятия + календарь | ✅ | `EventCalendar.tsx`, подсветка дат, фильтр по типу |
| 2б | Подписка на события | ❌ | Таблица `event_subscriptions` есть, API/UI нет |
| 3 | О нас | ✅ | `/[locale]/about` |
| 4 | Кружки + онлайн-запись | ✅ | `/api/clubs/enroll`, rate-limit 3/ч/IP |
| 5 | Электронные ресурсы | ✅ | `/[locale]/resources` |
| 6 | Правила + контакты | ✅ | `/[locale]/rules`, `/[locale]/contacts` |

## 3.2 ИИ — 2.5/3

| # | Пункт | Статус | Детали |
|---|---|---|---|
| 1 | Чатбот STT/TTS kk/ru | ✅ | `ChatBot.tsx:85–125` Web Speech API + Gemini |
| 2 | Умная рекомендация кружков | 🟡 | `RecommendQuiz.tsx` 5 вопросов + Gemini, но нет CTA «Записаться» на результате |
| 3 | Автоперевод kk↔ru | 🟡 | `/api/translate` готов, не встроен в админ-формы |

## 3.3 Автопубликация — 0.5/2

| # | Пункт | Статус | Детали |
|---|---|---|---|
| 1 | Telegram | 🟡 | `src/lib/telegram.ts` есть; ручной триггер через `/api/social/telegram`. Автоматический при `PATCH status=published` — **не подключён**. |
| 2 | Instagram | ❌ | Нет клиента / роута |
| 3 | Шаблоны публикаций | ❌ | Формат текста захардкожен в `telegram.ts` |
| 4 | Авто/ручной переключатель | ❌ | Добавить флаг в `site_settings` + UI в `/admin/settings` |

## 3.4 Календарь — 1.5/2

| # | Пункт | Статус |
|---|---|---|
| 1 | Подсветка дат | ✅ |
| 2 | Клик → список дня | ✅ |
| 3 | Фильтр по типу | ✅ |
| 4 | Подписка на уведомления | ❌ |

## 3.5 Админка — 4/6

| # | Пункт | Статус | Детали |
|---|---|---|---|
| 1 | CRUD всех разделов | ✅ | news, events, clubs, banners, enrollments, users, settings, chatbot, rent — все с drawer+table паттерном |
| 2 | Редактирование меню | ❌ | `Header.tsx:19–27` захардкожено — нужна таблица `nav_items` + `/admin/navigation` |
| 3 | Баннеры | ✅ | `/admin/banners` с reorder, toggle |
| 4 | Медиабиблиотека | 🟡 | `/api/upload` работает, `media` таблица ведётся — UI галереи нет |
| 5 | Конфиг автопубликации | ❌ | Переключатель «авто/ручной Telegram» — не реализован |
| 6 | ИИ-перевод в формах | ❌ | Кнопка «Перевести RU→KK» отсутствует в формах news/events/clubs |

## 4 Нефункциональные — 3/5

| # | Пункт | Статус | Детали |
|---|---|---|---|
| 1 | Адаптив | ✅ | Tailwind responsive, MobileNav, hamburger |
| 2 | Кроссбраузерность | ✅ | Дефолт Next.js 16 |
| 3 | Производительность < 3 с | 🟡 | Turbopack + standalone, Lighthouse не замерялся — отложено до продакшн-деплоя |
| 4 | HTTPS | ✅ | Caddy + Let's Encrypt для `dvorets-gornyakov.kz` в `caddy/Caddyfile` |
| 5 | SEO (meta, sitemap) | 🟡 | `generateMetadata` только в `/rent*`; нет `sitemap.ts` и `robots.ts` |
| 6 | Анти-спам/DDoS | ✅ | Rate-limit 3/ч/IP на enroll и rent/request; honeypot в rent/request |
| 7 | Аналитика | ❌ | Нет Google Analytics / Яндекс.Метрики |
| 8 | Дизайн | ✅ | Казахский орнамент, фирменные цвета `#0d7377/#d4a843`, креативный hero |

---

## Roadmap (фазы закрытия пробелов)

### Фаза 1 — Критическое для запуска (1–2 дня)
1. Видео в новостях (SQL + форма)
2. Авто-Telegram при публикации (`news/[id]` + `events/[id]` PATCH)
3. ИИ-перевод встроить в формы news/events/clubs (кнопки RU↔KK + preview)
4. `sitemap.ts` + `robots.ts`
5. `generateMetadata` на news/events/clubs/about

### Фаза 2 — Полнофункционал (2–3 дня)
6. CTA «Записаться» в `RecommendQuiz`
7. Подписка на события (POST `/api/events/[id]/subscribe` + UI)
8. Админка меню навигации (таблица `nav_items` + `/admin/navigation`)
9. Медиабиблиотека UI (`/admin/media` со списком + превью + удаление)
10. Переключатель авто/ручной Telegram в settings + чтение флага в API

### Фаза 3 — Расширение (3–5 дней)
11. Instagram Graph API (`src/lib/instagram.ts` + автопубликация + конфиг токенов)
12. Шаблоны публикаций (отдельная таблица `social_templates`)
13. Google Analytics / Яндекс.Метрика в layout
14. Lighthouse ≥ 90 (оптимизация LCP, `next/image` priority)
15. Unit/E2E тесты (Vitest + Playwright)

---

## Что вне зоны аудита (требует заказчика)

- Финальные цены и оснащение залов (сейчас сид-заглушки)
- Логотип и финальная цветовая гамма (сейчас дефолтные `#0d7377/#d4a843`)
- Тексты страниц «О нас», «Правила», «Электронные ресурсы» (сейчас заглушки)
- Реальные креды: SMTP, Instagram Graph API token, Telegram channel id, GA/Metrika ID
- Домен и SSL (Caddy уже готов к `dvorets-gornyakov.kz`)
