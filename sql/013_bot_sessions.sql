-- 013_bot_sessions.sql
-- Состояние диалога бота бронирования залов (Telegram + WhatsApp).
-- Ключ — (channel, chat_id). data хранит частично собранную заявку.

CREATE TABLE IF NOT EXISTS bot_sessions (
  channel    TEXT NOT NULL,                       -- 'telegram' | 'whatsapp'
  chat_id    TEXT NOT NULL,                        -- id чата/номер
  step       TEXT NOT NULL DEFAULT 'lang',         -- текущий шаг FSM
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,   -- собранные поля заявки
  locale     TEXT NOT NULL DEFAULT 'ru',           -- 'ru' | 'kk'
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel, chat_id)
);

CREATE INDEX IF NOT EXISTS idx_bot_sessions_updated ON bot_sessions(updated_at);
