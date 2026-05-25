-- Навигация v3 (2026-05-25): «Ещё» → группа «О нас».
-- Контакты переносятся внутрь «О нас», Новости выносятся в primary-ряд,
-- Ресурсы убираются из меню (теперь в верхней строке TopBar над навигацией).
-- Идемпотентно.

-- 1. Бывшая группа 'more' («Ещё») становится «О нас» / «Біз туралы».
UPDATE nav_items SET title_ru = 'О нас', title_kk = 'Біз туралы', url = '#', sort_order = 60
WHERE slug = 'more';

-- 2. Контакты — внутрь группы «О нас».
UPDATE nav_items SET parent_id = (SELECT id FROM nav_items WHERE slug = 'more' LIMIT 1),
       sort_order = 20 WHERE slug = 'contacts';

-- 3. «О нас» (страница /about) — первым пунктом внутри группы.
UPDATE nav_items SET parent_id = (SELECT id FROM nav_items WHERE slug = 'more' LIMIT 1),
       sort_order = 10 WHERE slug = 'about';

-- 4. Новости — наверх, в primary-ряд.
UPDATE nav_items SET parent_id = NULL, sort_order = 50 WHERE slug = 'news';

-- 5. Ресурсы — убрать из меню (страница /resources и TopBar остаются).
UPDATE nav_items SET is_active = FALSE WHERE slug = 'resources';
