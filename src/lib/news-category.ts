import type { Locale } from "./i18n";

const MAP_RU: Record<string, string> = {
  events: "События",
  event: "Событие",
  announcement: "Объявление",
  announcements: "Объявления",
  news: "Новости",
  achievements: "Достижения",
  achievement: "Достижение",
  exhibition: "Выставка",
  exhibitions: "Выставки",
  concert: "Концерт",
  concerts: "Концерты",
  workshop: "Мастер-класс",
  workshops: "Мастер-классы",
  festival: "Фестиваль",
  festivals: "Фестивали",
  competitions: "Конкурсы",
  competition: "Конкурс",
  general: "Общее",
};

const MAP_KK: Record<string, string> = {
  events: "Іс-шаралар",
  event: "Іс-шара",
  announcement: "Хабарландыру",
  announcements: "Хабарландырулар",
  news: "Жаңалықтар",
  achievements: "Жетістіктер",
  achievement: "Жетістік",
  exhibition: "Көрме",
  exhibitions: "Көрмелер",
  concert: "Концерт",
  concerts: "Концерттер",
  workshop: "Шеберлік сабағы",
  workshops: "Шеберлік сабақтары",
  festival: "Фестиваль",
  festivals: "Фестивальдер",
  competition: "Байқау",
  competitions: "Байқаулар",
  general: "Жалпы",
};

/**
 * Локализует категорию новости. Если категория уже на нужном языке (кириллица)
 * — возвращает как есть. Если это english slug-keyword (events, announcement и т.п.) —
 * мапит в локализованное название.
 */
export function localizeNewsCategory(category: string, locale: Locale): string {
  if (!category) return "";
  const isLatin = /^[a-z][a-z_-]*$/i.test(category.trim());
  if (!isLatin) return category;
  const key = category.trim().toLowerCase();
  const map = locale === "kk" ? MAP_KK : MAP_RU;
  return map[key] ?? category;
}
