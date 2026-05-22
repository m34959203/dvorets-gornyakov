-- 014_wa_auth.sql
-- Хранилище сессии WhatsApp (Baileys) в БД — чтобы переживать рестарты
-- контейнера без записываемого тома. Ключ id: 'creds' либо '<type>-<id>'.

CREATE TABLE IF NOT EXISTS wa_auth (
  id         TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
