-- Роль руководителя кружка + FK clubs → users
-- Обязательность контролируется на уровне приложения (Zod),
-- в БД колонка nullable для безопасной миграции существующих данных.

-- 1) Расширяем роли пользователей
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('admin', 'editor', 'instructor'));

-- 2) Добавляем FK на руководителя
ALTER TABLE clubs
    ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES users(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_clubs_instructor ON clubs(instructor_id);

-- 3) Для существующих кружков — ставим первого admin как временного руководителя,
--    чтобы не терять данные. В админке их потом переназначают.
DO $$
DECLARE default_user UUID;
BEGIN
    SELECT id INTO default_user FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1;
    IF default_user IS NOT NULL THEN
        UPDATE clubs SET instructor_id = default_user WHERE instructor_id IS NULL;
    END IF;
END $$;
