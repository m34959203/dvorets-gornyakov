import Link from "next/link";
import type { Hall } from "@/lib/rent/types";
import type { Locale } from "@/lib/i18n";
import { getLocalizedField } from "@/lib/i18n";

interface Props {
  hall: Hall;
  locale: Locale;
  labels: {
    capacity: string;
    from: string;
    currency: string;
    details: string;
  };
}

export default function HallCard({ hall, locale, labels }: Props) {
  const name = getLocalizedField(hall, "name", locale);
  const desc = getLocalizedField(hall, "description", locale);
  const cover = hall.photos?.[0]?.url;
  const alt = hall.photos?.[0]
    ? locale === "kk"
      ? hall.photos[0].alt_kk || name
      : hall.photos[0].alt_ru || name
    : name;

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/20 to-accent/20">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={alt}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-primary/40">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V9l9-6 9 6v12M9 21V12h6v9" />
            </svg>
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur">
          {labels.capacity}: {hall.capacity}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-gray-600">{desc}</p>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">{labels.from}</div>
            <div className="text-lg font-bold text-primary">
              {hall.event_price_from.toLocaleString("ru-RU")} {labels.currency}
            </div>
          </div>
          <Link
            href={`/${locale}/rent/${hall.slug}`}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {labels.details}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
