/**
 * Русская плюрализация: pluralRu(n, ["событие", "события", "событий"]).
 * Возвращает форму без числа.
 */
export function pluralRu(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

/**
 * pluralByLocale("ru", 3, { ru: ["событие","события","событий"], kk: "ис-шара" })
 * Казахская морфология не имеет ru-style плюрализации — единственная форма ("ис-шара" для 1, 5, 100 и т.д.).
 */
export function pluralByLocale(
  locale: "ru" | "kk",
  n: number,
  forms: { ru: [string, string, string]; kk: string }
): string {
  if (locale === "kk") return forms.kk;
  return pluralRu(n, forms.ru);
}
