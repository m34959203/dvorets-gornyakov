-- Статус 'cancelled' для броней (отмена уже одобренной — как в smart-library-cbs).
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending','approved','rejected','completed','cancelled'));
