-- Флаги автопубликации в соцсети + шаблоны
INSERT INTO site_settings (key, value) VALUES
    ('auto_telegram_news',   'true'),
    ('auto_telegram_events', 'true'),
    ('auto_instagram_news',  'false'),
    ('auto_instagram_events','false'),
    ('auto_facebook_news',   'false'),
    ('auto_facebook_events', 'false'),
    ('site_base_url', 'https://dvorets-gornyakov.kz')
ON CONFLICT (key) DO NOTHING;
