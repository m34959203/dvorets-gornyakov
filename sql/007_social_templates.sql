-- Шаблоны постов для Telegram/Instagram с двуязычным контентом и плейсхолдерами {{title_ru}} и др.

CREATE TABLE IF NOT EXISTS social_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('telegram', 'instagram')),
    kind VARCHAR(20) NOT NULL CHECK (kind IN ('news', 'event')),
    name VARCHAR(100) NOT NULL,
    body_kk TEXT NOT NULL DEFAULT '',
    body_ru TEXT NOT NULL DEFAULT '',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stpl_kind_platform ON social_templates(kind, platform, is_active);

-- Уникальный default per (platform, kind)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_stpl_default
    ON social_templates(platform, kind)
    WHERE is_default = TRUE;

-- Seed дефолтных шаблонов
INSERT INTO social_templates (platform, kind, name, body_ru, body_kk, is_default) VALUES
  ('telegram', 'news', 'Default news',
   '📰 <b>{{title_ru}}</b>' || E'\n' || '🇰🇿 <b>{{title_kk}}</b>' || E'\n\n' || '{{excerpt_ru}}' || E'\n\n' || '<a href="{{url}}">Читать / Оқу</a>',
   '📰 <b>{{title_kk}}</b>' || E'\n' || '🇷🇺 <b>{{title_ru}}</b>' || E'\n\n' || '{{excerpt_kk}}' || E'\n\n' || '<a href="{{url}}">Оқу / Читать</a>',
   TRUE),
  ('telegram', 'event', 'Default event',
   '🎭 <b>{{title_ru}}</b>' || E'\n' || '🇰🇿 <b>{{title_kk}}</b>' || E'\n\n' || '📅 {{date_ru}}' || E'\n' || '📍 {{location}}' || E'\n\n' || '<a href="{{url}}">Подробнее / Толығырақ</a>',
   '🎭 <b>{{title_kk}}</b>' || E'\n\n' || '📅 {{date_kk}}' || E'\n' || '📍 {{location}}' || E'\n\n' || '<a href="{{url}}">Толығырақ</a>',
   TRUE),
  ('instagram', 'news', 'Default news',
   '📰 {{title_ru}}' || E'\n' || '🇰🇿 {{title_kk}}' || E'\n\n' || '{{excerpt_ru}}' || E'\n\n' || 'Читать: {{url}}' || E'\n\n' || '#ДворецГорняков #Сатпаев #Культура',
   '📰 {{title_kk}}' || E'\n\n' || '{{excerpt_kk}}' || E'\n\n' || 'Оқу: {{url}}' || E'\n\n' || '#ДворецГорняков #Сәтбаев #Мәдениет',
   TRUE),
  ('instagram', 'event', 'Default event',
   '🎭 {{title_ru}}' || E'\n' || '🇰🇿 {{title_kk}}' || E'\n\n' || '📅 {{date_ru}}' || E'\n' || '📍 {{location}}' || E'\n\n' || 'Подробнее: {{url}}' || E'\n\n' || '#ДворецГорняков #Сатпаев #Мероприятие',
   '🎭 {{title_kk}}' || E'\n\n' || '📅 {{date_kk}}' || E'\n' || '📍 {{location}}' || E'\n\n' || 'Толығырақ: {{url}}' || E'\n\n' || '#ДворецГорняков #Сәтбаев',
   TRUE)
ON CONFLICT DO NOTHING;
