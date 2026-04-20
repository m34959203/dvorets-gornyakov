-- Analytics sessions + events + GA4/Yandex.Metrika settings keys

CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_key VARCHAR(64) UNIQUE NOT NULL,
  first_path VARCHAR(500) NOT NULL DEFAULT '',
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  referrer VARCHAR(1000),
  device_type VARCHAR(20),
  user_agent VARCHAR(500),
  country VARCHAR(2),
  page_view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asessions_created ON analytics_sessions(created_at DESC);

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_key VARCHAR(64) NOT NULL,
  type VARCHAR(50) NOT NULL,  -- pageview, enrollment_click, rent_request_submit, chatbot_open, quiz_complete
  path VARCHAR(500),
  referer VARCHAR(1000),
  target_id UUID,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aevents_session ON analytics_events(session_key);
CREATE INDEX IF NOT EXISTS idx_aevents_type ON analytics_events(type);
CREATE INDEX IF NOT EXISTS idx_aevents_created ON analytics_events(created_at DESC);

INSERT INTO site_settings (key, value) VALUES
  ('ga4_measurement_id', ''),
  ('yandex_metrika_id', '')
ON CONFLICT (key) DO NOTHING;
