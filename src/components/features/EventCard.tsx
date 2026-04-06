import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Locale } from "@/lib/i18n";
import { getLocalizedField } from "@/lib/i18n";
import { formatDate, getEventTypeColor } from "@/lib/utils";

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
}

interface EventCardProps {
  event: Event;
  locale: Locale;
}

export default function EventCard({ event, locale }: EventCardProps) {
  const title = getLocalizedField(event, "title", locale);
  const startDate = new Date(event.start_date);

  const typeLabels: Record<string, Record<string, string>> = {
    concert: { kk: "Концерт", ru: "Концерт" },
    exhibition: { kk: "Көрме", ru: "Выставка" },
    workshop: { kk: "Шеберхана", ru: "Мастер-класс" },
    festival: { kk: "Фестиваль", ru: "Фестиваль" },
    competition: { kk: "Байқау", ru: "Конкурс" },
    other: { kk: "Басқа", ru: "Другое" },
  };

  return (
    <Card hoverable>
      <Link href={`/${locale}/events/${event.id}`}>
        <div className="flex">
          {/* Date badge */}
          <div className="shrink-0 w-20 flex flex-col items-center justify-center bg-primary text-white p-3">
            <span className="text-2xl font-bold">{startDate.getDate()}</span>
            <span className="text-xs uppercase">
              {startDate.toLocaleDateString(locale === "kk" ? "kk-KZ" : "ru-RU", { month: "short" })}
            </span>
          </div>
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{title}</h3>
              <span className={`shrink-0 w-2 h-2 rounded-full mt-2 ${getEventTypeColor(event.event_type)}`} />
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(event.start_date, locale)}
              </span>
            </div>
            {event.location && (
              <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
            <div className="mt-2">
              <Badge variant="info">
                {typeLabels[event.event_type]?.[locale] || event.event_type}
              </Badge>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
