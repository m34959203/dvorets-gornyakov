-- Media library: дополнительные поля для админки /admin/media
-- (оригинальное имя файла, размеры, alt-текст kk/ru, хеш для дедупликации)

ALTER TABLE media
  ADD COLUMN IF NOT EXISTS original_name VARCHAR(500) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS width INTEGER,
  ADD COLUMN IF NOT EXISTS height INTEGER,
  ADD COLUMN IF NOT EXISTS alt_kk VARCHAR(500) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS alt_ru VARCHAR(500) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hash VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_hash ON media(hash);
