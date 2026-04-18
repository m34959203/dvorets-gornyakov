"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { isValidLocale, type Locale, getMessages, getLocalizedField } from "@/lib/i18n";
import { formatDateTime } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import EventSubscribe from "@/components/features/EventSubscribe";

const demoEvent = {
  id: "1",
  title_kk: "Наурыз мерекесіне арналған концерт",
  title_ru: "Концерт к празднику Наурыз",
  description_kk: "Наурыз мейрамына арналған мерекелік концерт. Бағдарламада: ұлттық әндер, билер, аспаптық музыка. Кіру тегін.",
  description_ru: "Праздничный концерт, посвящённый празднику Наурыз. В программе: национальные песни, танцы, инструментальная музыка. Вход свободный.",
  image_url: null,
  event_type: "concert",
  start_date: "2026-03-22T18:00:00Z",
  end_date: "2026-03-22T20:00:00Z",
  location: "Негізгі зал / Главный зал",
  status: "upcoming",
};

export default function EventDetailPage() {
  const params = useParams();
  const localeParam = params.locale as string;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);
  const t = messages.events;

  const event = demoEvent;
  const title = getLocalizedField(event, "title", locale);
  const description = getLocalizedField(event, "description", locale);

  const typeLabels: Record<string, Record<string, string>> = {
    concert: { kk: "Концерт", ru: "Концерт" },
    exhibition: { kk: "Көрме", ru: "Выставка" },
    workshop: { kk: "Шеберхана", ru: "Мастер-класс" },
    festival: { kk: "Фестиваль", ru: "Фестиваль" },
    competition: { kk: "Байқау", ru: "Конкурс" },
    other: { kk: "Басқа", ru: "Другое" },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/${locale}/events`} className="inline-flex items-center text-primary hover:text-primary-dark mb-6">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {messages.common.back}
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <svg className="w-20 h-20 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4 gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <Badge variant="info">{typeLabels[event.event_type]?.[locale] || event.event_type}</Badge>
          </div>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDateTime(event.start_date, locale)}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>{event.location}</span>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <EventSubscribe
              eventId={event.id}
              locale={locale}
              labels={{ subscribe: t.subscribe, subscribeSuccess: t.subscribeSuccess }}
            />
            <span className="text-sm text-gray-500">
              {locale === "kk"
                ? "Іс-шара туралы еске салу алыңыз"
                : "Получите напоминание о мероприятии"}
            </span>
          </div>

          <div className="prose max-w-none text-gray-700 mb-8">
            <p>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
