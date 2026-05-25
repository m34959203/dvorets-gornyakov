import type { Locale } from "@/lib/i18n";

export interface ResourceLink {
  title_kk: string;
  title_ru: string;
  url: string;
  desc_kk: string;
  desc_ru: string;
}

/**
 * Полезные ссылки на партнёрские учреждения и государственные порталы.
 * Используются в верхней строке (TopBar) над навигацией и на странице /resources.
 */
export const RESOURCE_LINKS: ResourceLink[] = [
  {
    title_kk: "Мәдениет министрлігі",
    title_ru: "Министерство культуры",
    url: "https://www.gov.kz/memleket/entities/mcs",
    desc_kk: "ҚР Мәдениет және спорт министрлігі",
    desc_ru: "Министерство культуры и спорта РК",
  },
  {
    title_kk: "Ұлттық кітапхана",
    title_ru: "Национальная библиотека",
    url: "https://nlrk.kz",
    desc_kk: "Қазақстан Республикасының Ұлттық кітапханасы",
    desc_ru: "Национальная библиотека Республики Казахстан",
  },
  {
    title_kk: "Білім порталы",
    title_ru: "Образовательный портал",
    url: "https://bilimland.kz",
    desc_kk: "Балаларға арналған білім беру порталы",
    desc_ru: "Образовательный портал для детей",
  },
  {
    title_kk: "E-gov",
    title_ru: "E-gov",
    url: "https://egov.kz",
    desc_kk: "Электронды үкімет порталы",
    desc_ru: "Портал электронного правительства",
  },
];

export function resourceTitle(r: ResourceLink, locale: Locale): string {
  return locale === "kk" ? r.title_kk : r.title_ru;
}

export function resourceDesc(r: ResourceLink, locale: Locale): string {
  return locale === "kk" ? r.desc_kk : r.desc_ru;
}
