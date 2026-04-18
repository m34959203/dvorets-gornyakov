-- Видео в новостях: mp4 URL или iframe embed (YouTube/Vimeo)
ALTER TABLE news
    ADD COLUMN IF NOT EXISTS video_url  VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS embed_code TEXT NOT NULL DEFAULT '';
