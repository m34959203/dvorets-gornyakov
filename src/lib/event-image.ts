// Фолбэк-фото для событий и кружков, когда у записи в БД пустой image_url.
// Реальные фото Дворца (источник: КГКП «Центр культуры и творчества им. Ш. Дильдебаева»),
// лежат в public/photos/. Манифест с описанием каждого файла — dvorets-photos/README.md.

const EVENT_FALLBACK: Record<string, string> = {
  concert: "/photos/dvorets-07.webp",
  exhibition: "/photos/dvorets-06.webp",
  workshop: "/photos/dvorets-11.webp",
  festival: "/photos/dvorets-03.webp",
  competition: "/photos/dvorets-04.webp",
  other: "/photos/dvorets-09-1.webp",
};

const CLUB_FALLBACK: Record<string, string> = {
  vocal: "/photos/dvorets-05.webp",
  dance: "/photos/dvorets-11.webp",
  art: "/photos/dvorets-13.webp",
  theater: "/photos/dvorets-09-1.webp",
  music: "/photos/dvorets-04.webp",
  craft: "/photos/dvorets-08.webp",
  sport: "/photos/dvorets-10.webp",
  general: "/photos/dvorets-01.webp",
};

/** Фото-обложка события: image_url из БД, иначе фолбэк по типу. */
export function eventImage(imageUrl?: string | null, eventType?: string | null): string {
  if (imageUrl) return imageUrl;
  return EVENT_FALLBACK[eventType ?? ""] ?? EVENT_FALLBACK.other;
}

/** Фото-обложка кружка: image_url из БД, иначе фолбэк по категории. */
export function clubImage(imageUrl?: string | null, category?: string | null): string {
  if (imageUrl) return imageUrl;
  return CLUB_FALLBACK[category ?? ""] ?? CLUB_FALLBACK.general;
}
