import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getLocalizedField } from "@/lib/i18n";

interface Event {
  id: string;
  title_kk: string;
  title_ru: string;
  description_kk: string;
  description_ru: string;
  image_url: string | null;
  event_type: string;
  start_date: string;
  location: string;
  price?: string | null;
}

interface EventCardProps {
  event: Event;
  locale: Locale;
}

const TYPE_LABELS: Record<string, Record<Locale, string>> = {
  concert: { kk: "Концерт", ru: "Концерт" },
  exhibition: { kk: "Көрме", ru: "Выставка" },
  workshop: { kk: "Шеберхана", ru: "Мастер-класс" },
  festival: { kk: "Фестиваль", ru: "Фестиваль" },
  competition: { kk: "Байқау", ru: "Конкурс" },
  other: { kk: "Басқа", ru: "Событие" },
};

const MONTH_ABBR: Record<Locale, string[]> = {
  kk: ["ҚАҢ", "АҚП", "НАУ", "СӘУ", "МАМ", "МАУ", "ШІЛ", "ТАМ", "ҚЫР", "ҚАЗ", "ҚАР", "ЖЕЛ"],
  ru: ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"],
};

const FALLBACK_IMG: Record<string, string> = {
  concert: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&q=80",
  exhibition: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=1200&q=80",
  workshop: "https://images.unsplash.com/photo-1472162314594-eca3be56d8f4?w=1200&q=80",
  festival: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80",
  competition: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80",
  other: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&q=80",
};

export default function EventCard({ event, locale }: EventCardProps) {
  const title = getLocalizedField(event, "title", locale);
  const d = new Date(event.start_date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTH_ABBR[locale][d.getMonth()] || "";
  const time = d.toLocaleTimeString(locale === "kk" ? "kk-KZ" : "ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const img = event.image_url || FALLBACK_IMG[event.event_type] || FALLBACK_IMG.other;
  const isFree = event.price === "0" || event.price === "free" || event.price === null || event.price === undefined;
  const priceLabel = isFree
    ? locale === "kk"
      ? "Тегін"
      : "Бесплатно"
    : event.price || (locale === "kk" ? "Билет бар" : "Купить");
  const categoryLabel = TYPE_LABELS[event.event_type]?.[locale] || event.event_type;

  return (
    <Link href={`/${locale}/events/${event.id}`} className="event-card no-underline">
      <div className="event-media">
        <img src={img} alt={title} loading="lazy" />
        <span className="event-badge">{categoryLabel}</span>
        <div className="event-date-chip">
          <div className="d">{day}</div>
          <div className="m">{month}</div>
        </div>
      </div>
      <div className="event-body">
        <h3 className="event-title">{title}</h3>
        <div className="event-meta">
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {time}
          </span>
          {event.location && (
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {event.location}
            </span>
          )}
        </div>
        <div className="event-foot">
          <span className={`event-price ${isFree ? "free" : ""}`}>{priceLabel}</span>
          <span className="event-link">
            {locale === "kk" ? "Билет алу" : "Купить билет"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
