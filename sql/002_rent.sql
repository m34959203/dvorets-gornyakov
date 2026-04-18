-- Модуль «Аренда залов» v1
-- Таблицы: halls, rental_requests. View: hall_busy_days.

-- 1) Залы
CREATE TABLE halls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_kk VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    description_kk TEXT NOT NULL DEFAULT '',
    description_ru TEXT NOT NULL DEFAULT '',
    capacity INTEGER NOT NULL DEFAULT 0 CHECK (capacity >= 0),
    equipment_kk JSONB NOT NULL DEFAULT '[]',
    equipment_ru JSONB NOT NULL DEFAULT '[]',
    hourly_price INTEGER NOT NULL DEFAULT 0 CHECK (hourly_price >= 0),
    event_price_from INTEGER NOT NULL DEFAULT 0 CHECK (event_price_from >= 0),
    photos JSONB NOT NULL DEFAULT '[]',
    layout_url VARCHAR(1000),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_halls_active ON halls(is_active, sort_order);
CREATE INDEX idx_halls_slug ON halls(slug);

-- 2) Заявки на аренду
CREATE TABLE rental_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hall_id UUID NOT NULL REFERENCES halls(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255) NOT NULL,
    event_type VARCHAR(32) NOT NULL DEFAULT 'other'
        CHECK (event_type IN ('concert', 'conference', 'corporate', 'school', 'other')),
    event_date DATE NOT NULL,
    time_from TIME NOT NULL,
    time_to TIME NOT NULL,
    guests INTEGER NOT NULL CHECK (guests > 0 AND guests <= 2000),
    equipment JSONB NOT NULL DEFAULT '[]',
    message TEXT NOT NULL DEFAULT '',
    status VARCHAR(16) NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'contacted', 'confirmed', 'rejected', 'completed')),
    admin_note TEXT NOT NULL DEFAULT '',
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (time_to > time_from)
);

CREATE INDEX idx_rental_requests_status ON rental_requests(status);
CREATE INDEX idx_rental_requests_hall_date ON rental_requests(hall_id, event_date);
CREATE INDEX idx_rental_requests_ip ON rental_requests(ip_address, created_at);
CREATE INDEX idx_rental_requests_created ON rental_requests(created_at DESC);

-- Частичный уникальный индекс: одно подтверждённое бронирование на зал/день/начало
CREATE UNIQUE INDEX uniq_confirmed_booking
    ON rental_requests (hall_id, event_date, time_from)
    WHERE status = 'confirmed';

-- 3) VIEW: занятые даты для календаря
CREATE OR REPLACE VIEW hall_busy_days AS
SELECT hall_id, event_date AS day, 'rental' AS source
FROM rental_requests
WHERE status = 'confirmed'
UNION ALL
SELECT
    h.id AS hall_id,
    (e.start_date AT TIME ZONE 'Asia/Almaty')::date AS day,
    'event' AS source
FROM events e
CROSS JOIN halls h
WHERE e.status IN ('upcoming', 'ongoing')
  AND lower(e.location) LIKE '%' || lower(h.name_ru) || '%'
   OR lower(e.location) LIKE '%' || lower(h.name_kk) || '%';

-- 4) Сид 3-х залов
INSERT INTO halls (slug, name_kk, name_ru, description_kk, description_ru,
                   capacity, equipment_kk, equipment_ru,
                   hourly_price, event_price_from, photos, sort_order) VALUES
(
    'grand',
    'Үлкен концерт залы',
    'Большой концертный зал',
    'Сарайдың басты залы — кең сахна, кәсіби дыбыс және жарық жүйелері, балкон. Концерт, фестиваль және үлкен іс-шараларға ыңғайлы.',
    'Главный зал дворца — просторная сцена, профессиональный звук и свет, балкон. Подходит для концертов, фестивалей и крупных мероприятий.',
    650,
    '["Кәсіби дыбыс жүйесі", "Сахналық жарық", "LED-экран", "3 гримёрка", "Wi-Fi", "Кондиционер"]'::jsonb,
    '["Профессиональный звук", "Сценический свет", "LED-экран", "3 гримёрки", "Wi-Fi", "Кондиционер"]'::jsonb,
    80000,
    350000,
    '[{"url":"/hero/hall-grand-1.jpg","alt_ru":"Большой зал, сцена","alt_kk":"Үлкен зал, сахна"}]'::jsonb,
    10
),
(
    'chamber',
    'Камералық зал',
    'Камерный зал',
    'Акустикалық ортасы жақсы шағын зал. Камералық концерт, презентация, лекция, қонақ жиналыстарына ыңғайлы.',
    'Небольшой зал с хорошей акустикой. Подходит для камерных концертов, презентаций, лекций и встреч.',
    120,
    '["Акустикалық жүйе", "Проектор", "Экран", "Wi-Fi", "Сахна"]'::jsonb,
    '["Акустическая система", "Проектор", "Экран", "Wi-Fi", "Сцена"]'::jsonb,
    35000,
    150000,
    '[{"url":"/hero/hall-chamber-1.jpg","alt_ru":"Камерный зал","alt_kk":"Камералық зал"}]'::jsonb,
    20
),
(
    'rehearsal',
    'Жаттығу залы',
    'Репетиционный зал',
    'Айна қабырғалы, таза еденді жаттығу залы. Би, вокал және театр ұжымдарына арналған.',
    'Зал с зеркальной стеной и ровным полом. Для танцевальных, вокальных и театральных репетиций.',
    40,
    '["Айналар", "Станок", "Пианино", "Дыбыс жүйесі", "Киім ауыстыру бөлмесі"]'::jsonb,
    '["Зеркала", "Станок", "Пианино", "Аудио-система", "Раздевалка"]'::jsonb,
    8000,
    40000,
    '[{"url":"/hero/hall-rehearsal-1.jpg","alt_ru":"Репетиционный зал","alt_kk":"Жаттығу залы"}]'::jsonb,
    30
);
