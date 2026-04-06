"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/ui/Calendar";
import EventCard from "@/components/features/EventCard";
import type { Locale } from "@/lib/i18n";

interface CalendarEvent {
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

interface EventCalendarProps {
  locale: Locale;
  initialEvents: CalendarEvent[];
}

export default function EventCalendar({ locale, initialEvents }: EventCalendarProps) {
  const [events] = useState<CalendarEvent[]>(initialEvents);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filteredEvents = filter === "all"
    ? events
    : events.filter((e) => e.event_type === filter);

  const calendarEvents = filteredEvents.map((e) => ({
    id: e.id,
    date: e.start_date,
    title: locale === "kk" ? e.title_kk : e.title_ru,
    type: e.event_type,
  }));

  useEffect(() => {
    if (!selectedDate) {
      setSelectedEvents(filteredEvents.slice(0, 5));
    }
  }, [filteredEvents, selectedDate]);

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    setSelectedDate(dateStr);
    const dayEvents = filteredEvents.filter((e) => {
      const eventDate = new Date(e.start_date).toISOString().split("T")[0];
      return eventDate === dateStr;
    });
    setSelectedEvents(dayEvents);
  };

  const types = [
    { value: "all", label: locale === "kk" ? "Барлығы" : "Все" },
    { value: "concert", label: locale === "kk" ? "Концерт" : "Концерт" },
    { value: "exhibition", label: locale === "kk" ? "Көрме" : "Выставка" },
    { value: "workshop", label: locale === "kk" ? "Шеберхана" : "Мастер-класс" },
    { value: "festival", label: locale === "kk" ? "Фестиваль" : "Фестиваль" },
    { value: "competition", label: locale === "kk" ? "Байқау" : "Конкурс" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type.value}
              onClick={() => { setFilter(type.value); setSelectedDate(null); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === type.value
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        <Calendar
          locale={locale}
          events={calendarEvents}
          onDayClick={handleDayClick}
        />
      </div>
      <div className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedDate
            ? new Date(selectedDate + "T00:00:00").toLocaleDateString(locale === "kk" ? "kk-KZ" : "ru-RU", { day: "numeric", month: "long", year: "numeric" })
            : locale === "kk" ? "Алдағы іс-шаралар" : "Предстоящие мероприятия"}
        </h3>
        {selectedEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {locale === "kk" ? "Іс-шаралар жоқ" : "Мероприятий нет"}
          </p>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((event) => (
              <EventCard key={event.id} event={event} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
