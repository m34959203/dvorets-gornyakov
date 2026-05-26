-- Тематические обложки для демо-событий сезона 2026.
-- Фолбэк по event_type давал всем мастер-классам один кадр (танцы, dvorets-11),
-- а всем концертам — один (вокалистка, dvorets-07). Проставляем image_url по теме
-- из заголовка. Идемпотентно (можно применять повторно).
-- Доступные сюжеты: 03 Наурыз/фольклор · 04 домбра/конкурс · 05 вокал · 06 выставка
-- прикладного искусства · 09-1 театр · 11 танцы · 13 изостудия/рисование · 14 детское творчество.

-- Мастер-классы (workshop) — по направлению
UPDATE events SET image_url = '/photos/dvorets-14.webp' WHERE title_ru = 'Мастер-класс по рукоделию';
UPDATE events SET image_url = '/photos/dvorets-11.webp' WHERE title_ru = 'Мастер-класс по танцам';
UPDATE events SET image_url = '/photos/dvorets-09-1.webp' WHERE title_ru = 'Театральный мастер-класс';
UPDATE events SET image_url = '/photos/dvorets-05.webp' WHERE title_ru = 'Вокальный мастер-класс';
UPDATE events SET image_url = '/photos/dvorets-13.webp' WHERE title_ru = 'Мастер-класс по рисованию';
UPDATE events SET image_url = '/photos/dvorets-06.webp' WHERE title_ru = 'Мастер-класс по декору';
UPDATE events SET image_url = '/photos/dvorets-14.webp' WHERE title_ru = 'Новогодний мастер-класс';

-- «Именные» концерты — тематическая ротация (остальные концерты остаются на fallback 07)
UPDATE events SET image_url = '/photos/dvorets-04.webp' WHERE title_ru = 'День домбры';
UPDATE events SET image_url = '/photos/dvorets-03.webp' WHERE title_ru = 'Вечер народной песни';
UPDATE events SET image_url = '/photos/dvorets-02.webp' WHERE title_ru = 'Вечер классической музыки';

-- Выставки — «юных художников» ближе к изостудии (рисование), остальные на fallback 06
UPDATE events SET image_url = '/photos/dvorets-13.webp' WHERE title_ru = 'Выставка юных художников';
