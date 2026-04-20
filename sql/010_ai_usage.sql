-- AI generations audit log + budget/limit settings

CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(30) NOT NULL DEFAULT 'gemini',
  model VARCHAR(100) NOT NULL,
  purpose VARCHAR(50) NOT NULL,  -- chatbot, translate, recommend, other
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aigen_created ON ai_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aigen_purpose ON ai_generations(purpose);
CREATE INDEX IF NOT EXISTS idx_aigen_model ON ai_generations(model);

INSERT INTO site_settings (key, value) VALUES
  ('ai_monthly_budget_usd', '20'),
  ('ai_daily_request_limit', '500')
ON CONFLICT (key) DO NOTHING;
