-- Dvorets Gornyakov Database Schema
-- PostgreSQL 16

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- News articles
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title_kk VARCHAR(500) NOT NULL,
    title_ru VARCHAR(500) NOT NULL,
    content_kk TEXT NOT NULL DEFAULT '',
    content_ru TEXT NOT NULL DEFAULT '',
    excerpt_kk VARCHAR(1000) NOT NULL DEFAULT '',
    excerpt_ru VARCHAR(1000) NOT NULL DEFAULT '',
    image_url VARCHAR(1000),
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_published_at ON news(published_at DESC);
CREATE INDEX idx_news_slug ON news(slug);

-- Clubs
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_kk VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    description_kk TEXT NOT NULL DEFAULT '',
    description_ru TEXT NOT NULL DEFAULT '',
    image_url VARCHAR(1000),
    age_group VARCHAR(50) NOT NULL DEFAULT 'all',
    direction VARCHAR(100) NOT NULL DEFAULT 'general',
    instructor_name VARCHAR(255) NOT NULL DEFAULT '',
    schedule JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clubs_active ON clubs(is_active);
CREATE INDEX idx_clubs_direction ON clubs(direction);

-- Enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    child_name VARCHAR(255) NOT NULL,
    child_age INTEGER NOT NULL CHECK (child_age > 0 AND child_age < 100),
    parent_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_enrollments_club ON enrollments(club_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_ip ON enrollments(ip_address, created_at);

-- Events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_kk VARCHAR(500) NOT NULL,
    title_ru VARCHAR(500) NOT NULL,
    description_kk TEXT NOT NULL DEFAULT '',
    description_ru TEXT NOT NULL DEFAULT '',
    image_url VARCHAR(1000),
    event_type VARCHAR(50) NOT NULL DEFAULT 'concert' CHECK (event_type IN ('concert', 'exhibition', 'workshop', 'festival', 'competition', 'other')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location VARCHAR(255) NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_start ON events(start_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_type ON events(event_type);

-- Event subscriptions (email notifications)
CREATE TABLE event_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    notified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, email)
);

-- Banners
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(1000) NOT NULL,
    link_url VARCHAR(1000),
    position VARCHAR(50) NOT NULL DEFAULT 'hero',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_banners_active ON banners(is_active, sort_order);

-- Static pages
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title_kk VARCHAR(500) NOT NULL,
    title_ru VARCHAR(500) NOT NULL,
    content_kk TEXT NOT NULL DEFAULT '',
    content_ru TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chatbot knowledge base
CREATE TABLE chatbot_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    question_kk TEXT NOT NULL DEFAULT '',
    question_ru TEXT NOT NULL DEFAULT '',
    answer_kk TEXT NOT NULL DEFAULT '',
    answer_ru TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chatbot_category ON chatbot_knowledge(category);

-- Site settings (key-value)
CREATE TABLE site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

-- Media library
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(500) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL DEFAULT 0,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default settings
INSERT INTO site_settings (key, value) VALUES
    ('site_name_kk', 'Ш. Ділдебаев атындағы тау-кенші сарайы'),
    ('site_name_ru', 'Дворец горняков им. Ш. Дільдебаева'),
    ('phone', '+7 (7102) 77-77-77'),
    ('email', 'info@dvorets-gornyakov.kz'),
    ('address_kk', 'Жезқазған қ., Абай д-лы, 10'),
    ('address_ru', 'г. Жезказган, пр. Абая, 10'),
    ('working_hours', '09:00-18:00'),
    ('telegram_channel', ''),
    ('instagram_handle', '');

-- Default about page
INSERT INTO pages (slug, title_kk, title_ru, content_kk, content_ru) VALUES
    ('about', 'Біз туралы', 'О нас',
     'Ш. Ділдебаев атындағы тау-кенші сарайы — Жезқазған қаласының мәдени орталығы.',
     'Дворец горняков им. Ш. Дільдебаева — культурный центр города Жезказган.'),
    ('rules', 'Кіру ережелері', 'Правила посещения',
     'Сарайға кіру ережелері мен шарттары.',
     'Правила и условия посещения дворца.'),
    ('resources', 'Электронды ресурстар', 'Электронные ресурсы',
     'Пайдалы электронды ресурстар тізімі.',
     'Список полезных электронных ресурсов.');
