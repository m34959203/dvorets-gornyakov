import type { Locale } from "./i18n";

/**
 * Локализация свободной строки `events.location`.
 *
 * `events.location` — свободный текст (админ вводит на одном языке), не FK на halls.
 * Поэтому на /kk показывалось русское «Большой концертный зал». Здесь приводим строку
 * к нужной локали по карте пар kk↔ru.
 *
 * Источник пар: таблица `halls` (name_kk/name_ru) — авторитетна для 3 залов.
 * EXTRA_VENUES — помещения, которых нет в halls, но встречаются в location
 * (галерея, фойе, хореозал и т.п.).
 */
export interface VenuePair {
  kk: string;
  ru: string;
}

// Помещения вне таблицы halls. Грамматику KK-названий держим консервативной:
// «Галерея» — интернационализм, оставляем как есть в обеих локалях.
const EXTRA_VENUES: VenuePair[] = [
  { kk: "Галерея", ru: "Галерея" },
  { kk: "Хореография залы", ru: "Хореографический зал" },
  { kk: "Фойе", ru: "Фойе" },
];

/**
 * Возвращает название помещения в нужной локали.
 * @param raw   строка из events.location (любая локаль)
 * @param locale целевая локаль
 * @param pairs пары из halls (обычно из БД); EXTRA_VENUES домешиваются автоматически
 */
export function localizeVenue(raw: string | null | undefined, locale: Locale, pairs: VenuePair[] = []): string {
  const s = (raw ?? "").trim();
  if (!s) return s;
  const norm = s.toLowerCase();
  for (const p of [...pairs, ...EXTRA_VENUES]) {
    if (p.ru.toLowerCase() === norm || p.kk.toLowerCase() === norm) {
      return locale === "kk" ? p.kk : p.ru;
    }
  }
  // Неизвестное помещение — возвращаем как ввёл админ (лучше, чем пусто).
  return s;
}
