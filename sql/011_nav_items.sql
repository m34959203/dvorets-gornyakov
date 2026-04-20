-- Navigation menu items (data-driven Header/MobileNav)

CREATE TABLE IF NOT EXISTS nav_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) NOT NULL,
  title_kk VARCHAR(200) NOT NULL,
  title_ru VARCHAR(200) NOT NULL,
  url VARCHAR(500) NOT NULL,  -- relative like /news or external https://
  parent_id UUID REFERENCES nav_items(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  target VARCHAR(10) NOT NULL DEFAULT '_self',  -- _self or _blank
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nav_parent_sort ON nav_items(parent_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_nav_active ON nav_items(is_active);

-- Seed current hardcoded Header menu
INSERT INTO nav_items (slug, title_kk, title_ru, url, sort_order) VALUES
  ('home',      'Басты',        'Главная',       '/',         10),
  ('news',      'Жаңалықтар',   'Новости',       '/news',     20),
  ('events',    'Іс-шаралар',   'Мероприятия',   '/events',   30),
  ('clubs',     'Үйірмелер',    'Кружки',        '/clubs',    40),
  ('rent',      'Жалға беру',   'Аренда залов',  '/rent',     50),
  ('about',     'Біз туралы',   'О нас',         '/about',    60),
  ('resources', 'Ресурстар',    'Ресурсы',       '/resources',70),
  ('contacts',  'Байланыс',     'Контакты',      '/contacts', 80)
ON CONFLICT DO NOTHING;
