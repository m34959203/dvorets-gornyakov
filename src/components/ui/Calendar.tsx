"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: string;
}

interface CalendarProps {
  locale: Locale;
  events?: CalendarEvent[];
  onDayClick?: (date: Date, events: CalendarEvent[]) => void;
}

const dayNamesKk = ["Дс", "Сс", "Ср", "Бс", "Жм", "Сн", "Жс"];
const dayNamesRu = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const monthNamesKk = ["Қаңтар", "Ақпан", "Наурыз", "Сәуір", "Мамыр", "Маусым", "Шілде", "Тамыз", "Қыркүйек", "Қазан", "Қараша", "Желтоқсан"];
const monthNamesRu = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

export default function Calendar({ locale, events = [], onDayClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const dayNames = locale === "kk" ? dayNamesKk : dayNamesRu;
  const monthNames = locale === "kk" ? monthNamesKk : monthNamesRu;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7; // Monday-based
    const totalDays = lastDay.getDate();

    const result: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) result.push(null);
    for (let i = 1; i <= totalDays; i++) result.push(i);
    return result;
  }, [year, month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    events.forEach((event) => {
      const d = new Date(event.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        const existing = map.get(day) || [];
        existing.push(event);
        map.set(day, existing);
      }
    });
    return map;
  }, [events, year, month]);

  const typeColors: Record<string, string> = {
    concert: "bg-purple-400",
    exhibition: "bg-blue-400",
    workshop: "bg-green-400",
    festival: "bg-orange-400",
    competition: "bg-red-400",
    other: "bg-gray-400",
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((name) => (
          <div key={name} className="text-center text-sm font-medium text-gray-500 py-2">
            {name}
          </div>
        ))}
        {days.map((day, i) => {
          const dayEvents = day ? eventsByDay.get(day) || [] : [];
          return (
            <div
              key={i}
              className={cn(
                "calendar-day relative text-center py-2 rounded-lg text-sm min-h-[40px] flex flex-col items-center justify-center",
                day && "cursor-pointer hover:bg-primary-light hover:text-white",
                day && isToday(day) && "bg-primary text-white font-bold",
                day && dayEvents.length > 0 && "has-event font-medium",
                !day && "invisible"
              )}
              onClick={() => {
                if (day && onDayClick) {
                  onDayClick(new Date(year, month, day), dayEvents);
                }
              }}
            >
              {day}
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((e, j) => (
                    <span key={j} className={cn("w-1.5 h-1.5 rounded-full", typeColors[e.type] || typeColors.other)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
