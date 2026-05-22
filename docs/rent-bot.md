# Бот бронирования залов (Telegram + WhatsApp)

Диалоговый бот ведёт пользователя по шагам (язык → зал → дата → время → гости →
формат → имя → телефон → email → подтверждение) и создаёт заявку в `rental_requests`
(та же таблица, что и веб-форма) + шлёт уведомление оператору в Telegram-канал.

## Архитектура

- FSM-движок: `src/lib/rent/bot/engine.ts` (чистый, общий для обоих каналов).
- Состояние диалога: таблица `bot_sessions` (миграция `sql/013_bot_sessions.sql`).
- Оркестратор: `src/lib/rent/bot/handle.ts` (`handleInbound(channel, chatId, text)`).
- Создание заявки: `src/lib/rent/create.ts` (`createRentalRequest`, общая с веб-формой).
- Транспорт: `src/lib/rent/bot/channels.ts` (Telegram Bot API / WhatsApp-гейт).
- Вебхуки: `src/app/api/rent/bot/telegram/route.ts`, `.../whatsapp/route.ts`.
- Кнопки на сайте: `rent/[slug]` → диплинки (`src/lib/rent/bot/links.ts`). Пока бот
  не настроен (нет username/номера) — показывается прежняя веб-форма как фолбэк.

## ENV

```
TELEGRAM_BOT_TOKEN=...           # уже есть (используется и для уведомлений)
TELEGRAM_BOT_USERNAME=...        # без @, для диплинка t.me/<bot>?start=rent_<slug>
TELEGRAM_WEBHOOK_SECRET=...      # произвольная строка, сверяется на вебхуке
TELEGRAM_CHANNEL_ID=...          # куда падают уведомления оператору (уже есть)

WHATSAPP_PHONE=+77013334455      # номер бота WA для wa.me-ссылки
WA_GATEWAY_SEND_URL=https://...  # эндпоинт Baileys-гейта для исходящих { to, message }
WA_GATEWAY_TOKEN=...             # Bearer для гейта (опц.)
WA_WEBHOOK_SECRET=...            # сверяется на /api/rent/bot/whatsapp (опц.)
```

Альтернатива env для сайта: значения `telegram_bot_username` и `whatsapp_phone`
в таблице `site_settings` (приоритетнее env для диплинков).

## Запуск

1. Применить миграцию: `docker exec -i dvorets-gornyakov-postgres-1 psql -U dvorets -d dvorets_db < sql/013_bot_sessions.sql`
2. Telegram: задать ENV, затем зарегистрировать вебхук (нужен публичный https):
   `npx tsx scripts/set-telegram-webhook.ts https://<домен>`
   Скрипт также печатает `@username` бота для `TELEGRAM_BOT_USERNAME`.
3. WhatsApp: настроить Baileys-гейт так, чтобы входящие слал на
   `POST https://<домен>/api/rent/bot/whatsapp?secret=<WA_WEBHOOK_SECRET>` телом
   `{ "from": "<jid/номер>", "text": "<текст>" }`, а `WA_GATEWAY_SEND_URL` указывал
   на его эндпоинт отправки `{ to, message }`. Кнопка на сайте предзаполняет
   текст `/start rent_<slug>`, который гейт пересылает вебхуку.

## Поведение

- `/start` (или `/start rent_<slug>` из диплинка) — начинает/сбрасывает диалог;
  при payload зал предвыбран, шаг зала пропускается.
- `/cancel`, «отмена» — сброс.
- Telegram рендерит варианты inline-кнопками; WhatsApp — нумерованным списком
  (пользователь отвечает цифрой).
