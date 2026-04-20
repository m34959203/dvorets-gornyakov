-- Durable job scheduler: scheduled_jobs table
-- Состояния: pending → running → done|failed; failed перепланируется с экспоненциальным backoff до 5 попыток.

CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,            -- publish_news, publish_event
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'done', 'failed')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sjobs_pending_runat
    ON scheduled_jobs(status, run_at)
    WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_sjobs_created ON scheduled_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sjobs_type ON scheduled_jobs(type);
