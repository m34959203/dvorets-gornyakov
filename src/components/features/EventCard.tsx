import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getLocalizedField } from "@/lib/i18n";
import { eventImage } from "@/lib/event-image";

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
  is_partner?: boolean;
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

export default function EventCard({ event, locale }: EventCardProps) {
  const title = getLocalizedField(event, "title", locale);
  const d = new Date(event.start_date);
  // Все даты/время приводим к Asia/Almaty: в UTC-контейнере badge и время
  // съезжают (вечерние события показывают чужой день и час «04:00»).
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Almaty",
    day: "2-digit",
    month: "numeric",
  }).formatToParts(d);
  const day = dateParts.find((p) => p.type === "day")?.value ?? "";
  const monthIdx =
    Number(dateParts.find((p) => p.type === "month")?.value ?? "1") - 1;
  const month = MONTH_ABBR[locale][monthIdx] || "";
  const time = d.toLocaleTimeString(locale === "kk" ? "kk-KZ" : "ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Almaty",
  });
  const img = eventImage(event.image_url, event.event_type);
  const entryLabel = event.is_partner
    ? locale === "kk" ? "Серіктестік" : "Партнёрское"
    : locale === "kk" ? "Тегін" : "Бесплатно";
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
          <span className={`event-price ${event.is_partner ? "" : "free"}`}>{entryLabel}</span>
          <span className="event-link">
            {locale === "kk" ? "Толығырақ" : "Подробнее"}
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
