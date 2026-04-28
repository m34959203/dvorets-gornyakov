-- 013_rent_free_update.sql
-- Обнулить тарифы аренды залов: ДКП — государственное учреждение, аренда бесплатна.
-- Миграция применима к существующим БД (002_rent.sql выполняется только на init).

UPDATE halls
SET hourly_price = 0,
    event_price_from = 0;
