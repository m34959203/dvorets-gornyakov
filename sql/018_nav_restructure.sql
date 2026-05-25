-- Реструктуризация навигации (P0-4 визуального аудита, 2026-05-25)
-- Было: 8 плоских пунктов в один ряд (теснили логотип, нет иерархии).
-- Стало: primary-ряд из 5 + выпадающая группа «Ещё» (О нас · Новости · Ресурсы).
-- Идемпотентно: можно прогонять повторно.

-- 1. Группа-родитель «Ещё». url='#' — это не ссылка, а тоггл дропдауна.
INSERT INTO nav_items (slug, title_kk, title_ru, url, sort_order, parent_id)
VALUES ('more', 'Тағы', 'Ещё', '#', 60, NULL)
ON CONFLICT DO NOTHING;

-- 2. Перепривязываем вторичные пункты под «Ещё» и задаём порядок внутри группы.
UPDATE nav_items SET parent_id = (SELECT id FROM nav_items WHERE slug = 'more' LIMIT 1),
       sort_order = 10 WHERE slug = 'about';
UPDATE nav_items SET parent_id = (SELECT id FROM nav_items WHERE slug = 'more' LIMIT 1),
       sort_order = 20 WHERE slug = 'news';
UPDATE nav_items SET parent_id = (SELECT id FROM nav_items WHERE slug = 'more' LIMIT 1),
       sort_order = 30 WHERE slug = 'resources';

-- 3. Порядок primary-ряда: Главная · Афиша · Кружки · Аренда · Контакты · [Ещё].
UPDATE nav_items SET sort_order = 10 WHERE slug = 'home';
UPDATE nav_items SET sort_order = 20 WHERE slug = 'events';
UPDATE nav_items SET sort_order = 30 WHERE slug = 'clubs';
UPDATE nav_items SET sort_order = 40 WHERE slug = 'rent';
UPDATE nav_items SET sort_order = 50 WHERE slug = 'contacts';
-- 'more' уже sort_order=60 из шага 1.
