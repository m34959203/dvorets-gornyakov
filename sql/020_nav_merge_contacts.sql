-- Навигация v4 (2026-05-25): страницы «О нас» и «Контакты» объединены в одну (/about).
-- «О нас» снова обычный пункт верхнего уровня (без дропдауна).
-- Идемпотентно.

-- 1. «О нас» (about) — наверх, обычной ссылкой на /about.
UPDATE nav_items SET parent_id = NULL, url = '/about', sort_order = 60, is_active = TRUE
WHERE slug = 'about';

-- 2. Отдельный пункт «Контакты» больше не нужен (страница объединена).
UPDATE nav_items SET is_active = FALSE WHERE slug = 'contacts';

-- 3. Группа-обёртка «О нас» (бывшая «Ещё», slug 'more') больше не нужна.
UPDATE nav_items SET is_active = FALSE WHERE slug = 'more';
