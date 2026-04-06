import kkMessages from "@/messages/kk.json";
import ruMessages from "@/messages/ru.json";

export const locales = ["kk", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "kk";

const messages: Record<Locale, Record<string, Record<string, string>>> = {
  kk: kkMessages as Record<string, Record<string, string>>,
  ru: ruMessages as Record<string, Record<string, string>>,
};

export function getMessages(locale: Locale): Record<string, Record<string, string>> {
  return messages[locale] || messages[defaultLocale];
}

export function t(locale: Locale, section: string, key: string): string {
  const sectionData = messages[locale]?.[section];
  if (!sectionData) return key;
  return sectionData[key] ?? key;
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLocalizedField(
  item: any,
  field: string,
  locale: Locale
): string {
  const key = `${field}_${locale}`;
  return (item[key] as string) || (item[`${field}_kk`] as string) || "";
}
