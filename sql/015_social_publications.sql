-- 015_social_publications.sql
-- Журнал автопубликаций в соцсети (по образцу AIMAK social_media_publication):
-- лог каждой попытки + дедуп (не публиковать повторно туда, где уже SUCCESS).

CREATE TABLE IF NOT EXISTS social_publications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kind        TEXT NOT NULL,            -- 'news' | 'events'
  item_id     TEXT NOT NULL,            -- news.slug | event.id
  platform    TEXT NOT NULL,            -- 'telegram' | 'instagram' | 'facebook'
  status      TEXT NOT NULL,            -- 'success' | 'failed'
  external_id TEXT,                     -- id поста в соцсети (если доступен)
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_pub_item ON social_publications(kind, item_id, platform);
CREATE INDEX IF NOT EXISTS idx_social_pub_created ON social_publications(created_at DESC);
