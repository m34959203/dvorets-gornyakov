import type { Locale } from "./i18n";

// Базовый URL для абсолютных ссылок в structured data (совпадает с metadataBase/canonical).
export function siteBase(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://dvorets-gornyakov.kz").replace(/\/$/, "");
}

const NAME = {
  kk: "Ш. Ділдебаев атындағы тау-кеншілер сарайы",
  ru: "Дворец горняков им. Ш. Дильдебаева",
} as const;

/** Organization / PerformingArtsTheater для главной. Данные — как на /about и в футере. */
export function organizationJsonLd(locale: Locale) {
  const base = siteBase();
  return {
    "@context": "https://schema.org",
    "@type": "PerformingArtsTheater",
    name: NAME[locale],
    url: `${base}/${locale}`,
    image: `${base}/photos/og-cover.jpg`,
    logo: `${base}/icon-512.png`,
    telephone: "+7 (71063) 6-23-30",
    address: {
      "@type": "PostalAddress",
      streetAddress: locale === "kk" ? "Қ.И. Сәтбаев даңғылы, 106" : "Проспект К.И. Сатпаева, 106",
      addressLocality: locale === "kk" ? "Сәтбаев" : "Сатпаев",
      addressRegion: locale === "kk" ? "Ұлытау облысы" : "Улытауская область",
      postalCode: "101300",
      addressCountry: "KZ",
    },
    geo: { "@type": "GeoCoordinates", latitude: 47.8889, longitude: 67.5429 },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday"], opens: "10:00", closes: "17:00" },
    ],
  };
}

/** Event для деталки события. */
export function eventJsonLd(opts: {
  locale: Locale;
  name: string;
  startDate: string;
  endDate?: string | null;
  location: string;
  image: string;
  url: string;
}) {
  const base = siteBase();
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: opts.name,
    startDate: opts.startDate,
    ...(opts.endDate ? { endDate: opts.endDate } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: opts.image.startsWith("http") ? opts.image : `${base}${opts.image}`,
    url: opts.url,
    location: {
      "@type": "Place",
      name: opts.location || NAME[opts.locale],
      address: opts.locale === "kk" ? "Сәтбаев қ., Қ.И. Сәтбаев даңғылы, 106" : "г. Сатпаев, пр. К.И. Сатпаева, 106",
    },
    organizer: { "@type": "Organization", name: NAME[opts.locale], url: `${base}/${opts.locale}` },
    offers: { "@type": "Offer", price: "0", priceCurrency: "KZT", availability: "https://schema.org/InStock", url: opts.url },
  };
}

/** NewsArticle для деталки новости. */
export function newsArticleJsonLd(opts: {
  locale: Locale;
  headline: string;
  datePublished?: string | null;
  image: string;
  url: string;
}) {
  const base = siteBase();
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: opts.headline,
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    image: opts.image.startsWith("http") ? opts.image : `${base}${opts.image}`,
    url: opts.url,
    publisher: {
      "@type": "Organization",
      name: NAME[opts.locale],
      logo: { "@type": "ImageObject", url: `${base}/icon-512.png` },
    },
  };
}

/** BreadcrumbList из крошек страницы (href относительные). */
export function breadcrumbJsonLd(crumbs: Array<{ label: string; href?: string }>) {
  const base = siteBase();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${base}${c.href}` } : {}),
    })),
  };
}
