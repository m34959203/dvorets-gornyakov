# ТЗ: Модуль «Аренда залов»

**Проект:** Дворец горняков им. Ш. Дільдебаева (`dvorets-gornyakov`)
**Автор:** TechnoKod / m34959203
**Версия:** 0.1 — 2026-04-18
**Статус:** черновик к согласованию

---

## 1. Цель и бизнес-контекст

Дворец сдаёт в аренду 3 зала (большой концертный, камерный, репетиционный) для концертов, конференций, корпоративов и школьных мероприятий. Сейчас заявки идут через телефон и мессенджеры — теряются, дублируются, нет истории. Нужен онлайн-поток «узнал → выбрал зал → оставил заявку → получил КП → подписал договор», с админской очередью и синхронизацией с афишей.

**KPI v1:** минимум 30 % заявок на аренду приходит через форму, не через звонок; администратор отвечает ≤1 ч в рабочее время; ноль «двойных бронирований».

---

## 2. Область v1 (in scope)

- Публичная страница `/[locale]/rent` с описанием 3 залов, техникой, ценами, чек-листом (уже есть), галереей, календарём занятости, формой заявки.
- Страница зала `/[locale]/rent/[slug]` — детальная карточка зала.
- Форма заявки (без платежа): контакт, формат события, дата, время, кол-во гостей, оборудование, комментарий.
- Админка `/[locale]/admin/rent`: таблица заявок, статусы, фильтры, примечания; CRUD залов (фото, цена, вместимость, оснащение).
- Уведомления: Telegram-канал администратора + email на `mdtech.top@gmail.com`.
- Блокировка дат на основании подтверждённых заявок и событий из афиши (таблица `events`).
- Локализация ru/kk, SEO-meta, sitemap-запись.

## 3. Вне v1 (out of scope)

- Онлайн-оплата предоплаты (v2).
- Автогенерация договора PDF (v2).
- Синхронизация с Google Calendar администратора (v2).
- Публичный рейтинг/отзывы арендаторов (v2).

---

## 4. Пользовательские сценарии

### 4.1 Арендатор (public)
1. Попадает на `/rent` из hero-CTA «Арендовать зал» или из меню.
2. Видит hero-блок зала, 3 карточки залов, чек-лист (уже сверстан), календарь занятости (просмотр), FAQ, форму заявки.
3. Выбирает зал → попадает на `/rent/[slug]` → смотрит галерею (6–10 фото), план сцены, тех-райдер (свет/звук/проектор), цену (за час / за событие).
4. Кликает «Оставить заявку» → модалка формы с предзаполненным `hall_id` и датой (если кликнул по дню календаря).
5. Отправляет → получает on-screen подтверждение + автоответ на email.

### 4.2 Администратор (admin)
1. `/admin/rent/requests` — список заявок со статусами: `new` / `contacted` / `confirmed` / `rejected` / `completed`.
2. Клик по заявке → деталь, поле «Комментарий администратора», кнопки перехода статусов, быстрые ссылки: написать в WhatsApp / Telegram, скопировать email.
3. `/admin/rent/halls` — CRUD залов: фото, цена, оснащение, схема, slug.
4. Смена статуса `confirmed` с указанной датой/временем — автоматически добавляет блок в календарь занятости.

### 4.3 Оператор афиши
- События из `events` (event_type `concert/festival/workshop/...`) также помечают даты как занятые → защита от двойного бронирования.

---

## 5. Data model (добавления к `sql/`)

### 5.1 `halls`
| поле | тип | описание |
|---|---|---|
| `id` | uuid PK | |
| `slug` | text unique | `grand`, `chamber`, `rehearsal` |
| `name_ru`, `name_kk` | text | |
| `description_ru`, `description_kk` | text | markdown |
| `capacity` | int | |
| `equipment_ru`, `equipment_kk` | jsonb | массив тех-пунктов |
| `hourly_price` | int | тенге |
| `event_price_from` | int | тенге, «от» |
| `photos` | jsonb | `[{url, alt_ru, alt_kk}]`, 1-я = cover |
| `layout_url` | text nullable | схема зала (PDF/PNG) |
| `is_active` | bool default true | |
| `sort_order` | int default 0 | |
| `created_at`, `updated_at` | timestamptz | |

### 5.2 `rental_requests`
| поле | тип | описание |
|---|---|---|
| `id` | uuid PK | |
| `hall_id` | uuid FK halls | |
| `name` | text | ФИО / название организации |
| `phone` | text | E.164, валидируется Zod |
| `email` | text | |
| `event_type` | text | concert / conference / corporate / school / other |
| `event_date` | date | |
| `time_from`, `time_to` | time | |
| `guests` | int | |
| `equipment` | jsonb | чеклбоксы: mic/projector/lights/streaming |
| `message` | text nullable | |
| `status` | text | `new/contacted/confirmed/rejected/completed` |
| `admin_note` | text nullable | |
| `ip` | inet | для rate-limit |
| `created_at`, `updated_at` | timestamptz | |

### 5.3 Блокировки дат (view, не таблица)
`hall_busy_days` = объединение `rental_requests` где `status='confirmed'` + `events` где `location_hall_id = halls.id`. Используется публичным API `/api/rent/availability`.

---

## 6. API

Формат — как в существующих роутах: `{ data: ... }` / `{ error: "message" }`.

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| GET | `/api/rent/halls` | public | список активных залов для `/rent` |
| GET | `/api/rent/halls/[slug]` | public | детальный зал |
| GET | `/api/rent/availability?hall_id=&month=YYYY-MM` | public | массив занятых дат месяца |
| POST | `/api/rent/request` | public + rate-limit 3/час/IP | создать заявку, Zod-валидация |
| GET | `/api/admin/rent/requests?status=&from=&to=` | admin/editor | список заявок + пагинация |
| PATCH | `/api/admin/rent/requests/[id]` | admin/editor | смена статуса + note |
| POST/PUT/DELETE | `/api/admin/rent/halls[/id]` | admin | CRUD залов |

Уведомления при `POST /api/rent/request`:
- Telegram: `src/app/api/social/telegram/route.ts` (существующий) — вызов `sendTelegramMessage`
- Email: новый `src/lib/mail.ts` через SMTP (hoster.kz) — опционально в v1, fallback = только Telegram.

Rate-limit: переиспользуем механизм из `/api/clubs/enroll` (3/час/IP).

---

## 7. UI

### 7.1 Страница `/rent`
- Hero: фото сцены, H1 «Арендуйте лучшие залы Жезказгана», CTA «Оставить заявку».
- Секция «Наши залы» — 3 карточки (grid-cols-3 на desktop, 1 — mobile): фото, название, вместимость, цена «от», кнопка «Подробнее».
- Секция «Чек-лист» — уже собрана в `RentalChecklist.tsx`, переиспользовать.
- Секция «Календарь занятости» — месячный календарь с легендой «занято / свободно / по запросу», переключатель по залу.
- Секция «FAQ» — аккордеон (6–8 вопросов: налог, КП, форма оплаты, парковка, кейтеринг, звукозапись).
- Секция «Форма заявки» — `<RentalRequestForm />`, отправка через `/api/rent/request`.

### 7.2 Страница `/rent/[slug]`
- Галерея (swiper), breadcrumbs, сайдбар с ценой и кнопкой «Оставить заявку», вкладки «Описание / Оснащение / Схема», мини-календарь только этого зала.

### 7.3 Админка
- `/admin/rent` — dashboard-cards: «Новые», «В работе», «Подтверждённые на неделе».
- `/admin/rent/requests` — таблица (status badge, ФИО, зал, дата, кол-во, создано), фильтры, сортировка. Клик → drawer.
- `/admin/rent/halls` — список + `/new`, `/[id]/edit` с `<PhotoUploader />` (переиспользовать `/api/upload`).

---

## 8. Тексты и локализация

- Ключи в `src/messages/*.json` в секции `rent.*` (страница), `rental.*` (чек-лист — уже есть), `admin.rent.*`.
- Шаблон автоответа email: `src/lib/mail-templates/rent-request.{ru,kk}.ts`.
- Шаблон Telegram-уведомления: `src/lib/notifications/rent-request.ts`.

---

## 9. Валидация (Zod)

```ts
export const rentalRequestSchema = z.object({
  hall_id: z.string().uuid(),
  name: z.string().min(2).max(120),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/),
  email: z.string().email(),
  event_type: z.enum(["concert", "conference", "corporate", "school", "other"]),
  event_date: z.string().date(),
  time_from: z.string().regex(/^\d{2}:\d{2}$/),
  time_to: z.string().regex(/^\d{2}:\d{2}$/),
  guests: z.number().int().min(1).max(2000),
  equipment: z.array(z.enum(["mic", "projector", "lights", "streaming", "catering"])).default([]),
  message: z.string().max(2000).optional(),
});
```

---

## 10. Безопасность

- Все input — Zod-валидация, SQL — параметризованные запросы через `pg`.
- Админ-роуты: middleware `requireAuth(["admin","editor"])` с try/catch AuthError → 401 (как требует `feedback_technokod_roles`).
- Rate-limit публичного POST (3/ч/IP), anti-spam honeypot-поле `website` (скрытое, должно быть пустым).
- CSRF: same-site cookie (уже стоит), POST только с того же origin.
- Размер заявки — `.max()` на всех строках, строгая длина.

---

## 11. Нефункциональные требования

- Lighthouse mobile ≥ 90 (performance, SEO, accessibility) на `/rent`.
- LCP hero < 2.5 с на 3G, фото — `next/image` с `priority` только на cover hero.
- A11y: клавиатурная навигация формы, aria-метки на иконках, контрастность `primary` / `accent` ≥ 4.5.
- I18n: URL `/ru/rent`, `/kk/rent`, canonical и `hreflang` на страницах.
- SEO: title, description, OpenGraph (cover hero), JSON-LD `Place` + `EventVenue`.

---

## 12. План работ и оценки

| # | Задача | Оценка |
|---|---|---|
| 1 | Миграции `halls`, `rental_requests`, view `hall_busy_days`, сид 3-х залов | 0.5 д |
| 2 | API: halls list/detail, availability | 0.5 д |
| 3 | API: rental_request POST + Telegram + email + rate-limit | 0.5 д |
| 4 | Страница `/rent` (карточки, FAQ, календарь, форма) | 1.5 д |
| 5 | Страница `/rent/[slug]` (галерея, мини-календарь) | 0.5 д |
| 6 | Админка: requests table + detail drawer + status-flow | 1 д |
| 7 | Админка: halls CRUD + uploader | 0.5 д |
| 8 | Локализация ru/kk, SEO, JSON-LD, sitemap | 0.5 д |
| 9 | QA: оба языка, мобилка, Lighthouse, rate-limit, два-бронирования | 0.5 д |
| 10 | Деплой + дымовое тестирование prod | 0.25 д |
| | **Итого** | **~6 дней** (1 разработчик) |

---

## 13. Риски

- **Двойное бронирование** при редком race condition между POST-заявкой и подтверждением — закрыть уникальным индексом `(hall_id, event_date, time_from) where status='confirmed'`.
- **Ложный flood заявок** через Tor — доп. honeypot + reCAPTCHA v3 (опция на v1.1).
- **Отсутствие SMTP** в `.env` → graceful fallback на Telegram-only (логировать warning).
- **Нет фото залов в PSD** → заглушки с градиентом (как в текущем hero); заменить после получения экспорта.

---

## 14. Definition of Done

- [ ] Все API покрыты интеграционным тестом (vitest + pg test-db), rate-limit проверен.
- [ ] Lighthouse mobile ≥ 90 на `/rent` и `/rent/grand`.
- [ ] Пройден ручной E2E: заявка → Telegram-уведомление → смена статуса в админке → дата заблокирована в календаре.
- [ ] ru/kk проверены на визуальные обрезки текста.
- [ ] Документация: добавить раздел в `docs/PAGES.md` и `docs/API-SPEC.md`.

---

## 15. Открытые вопросы

1. Финальные цены и перечень оснащения каждого зала — нужны от заказчика.
2. SMTP-реквизиты (hoster.kz) или остаёмся на Telegram-only в v1?
3. Кто модерирует заявки — один админ или несколько editor-ов?
4. Нужна ли защита reCAPTCHA в v1 или пока достаточно honeypot + rate-limit?
5. Интеграция с 1С/CRM в будущем — если да, какой формат выгрузки (CSV/webhook)?
