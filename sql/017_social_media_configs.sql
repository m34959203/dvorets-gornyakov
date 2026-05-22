-- 017_social_media_configs.sql
-- Per-platform конфиг автопубликации (по образцу AIMAK social_media_configs):
-- enabled + язык по умолчанию + токены/ID прямо в БД (редактируются в админке).

CREATE TABLE IF NOT EXISTS social_media_configs (
  platform              TEXT PRIMARY KEY,            -- 'telegram' | 'instagram' | 'facebook'
  enabled               BOOLEAN NOT NULL DEFAULT FALSE,
  default_language      TEXT NOT NULL DEFAULT 'kk',  -- 'kk' | 'ru'
  -- Telegram
  bot_token             TEXT,
  chat_id               TEXT,
  -- Instagram (Graph API)
  access_token          TEXT,
  page_id               TEXT,                        -- IG user id
  -- Facebook
  facebook_access_token TEXT,
  facebook_page_id      TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Стартовые строки: telegram включён (как и было), instagram/facebook выключены
INSERT INTO social_media_configs (platform, enabled, default_language) VALUES
  ('telegram',  TRUE,  'kk'),
  ('instagram', FALSE, 'kk'),
  ('facebook',  FALSE, 'kk')
ON CONFLICT (platform) DO NOTHING;
