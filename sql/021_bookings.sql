-- Бронирования залов через AI-бота (function calling). Отдельно от rental_requests
-- (форма/WhatsApp-FSM): канонический стор для бот-броней, админка /admin/bookings.
CREATE TABLE IF NOT EXISTS bookings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hall          TEXT NOT NULL CHECK (hall IN ('big','chamber','rehearsal')),
  date          DATE NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  organizer     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  purpose       TEXT NOT NULL,
  attendees     INT  NOT NULL CHECK (attendees > 0),
  status        TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','rejected','completed')),
  source        TEXT NOT NULL DEFAULT 'chatbot'
                 CHECK (source IN ('chatbot','form','phone')),
  locale        TEXT NOT NULL DEFAULT 'ru',
  notes_admin   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS bookings_status_date ON bookings(status, date);
CREATE INDEX IF NOT EXISTS bookings_date ON bookings(date);
