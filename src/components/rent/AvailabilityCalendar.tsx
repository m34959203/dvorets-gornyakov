"use client";

import { useEffect, useMemo, useState } from "react";
import type { Hall } from "@/lib/rent/types";
import type { Locale } from "@/lib/i18n";
import { getLocalizedField } from "@/lib/i18n";

interface Props {
  halls: Hall[];
  locale: Locale;
  labels: {
    selectHall: string;
    busy: string;
    free: string;
    onRequest: string;
    monthFormat: Intl.DateTimeFormatOptions;
  };
}

export default function AvailabilityCalendar({ halls, locale, labels }: Props) {
  const [hallId, setHallId] = useState<string>(halls[0]?.id ?? "");
  const [cursor, setCursor] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const monthStr = useMemo(() => {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, [cursor]);

  useEffect(() => {
    if (!hallId) return;
    setLoading(true);
    fetch(`/api/rent/availability?hall_id=${hallId}&month=${monthStr}`)
      .then((r) => r.json())
      .then((res) => {
        const set = new Set<string>();
        if (res.data?.busy) {
          for (const b of res.data.busy as { day: string }[]) set.add(b.day);
        }
        setBusy(set);
      })
      .catch(() => setBusy(new Set()))
      .finally(() => setLoading(false));
  }, [hallId, monthStr]);

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const startOffset = (first.getDay() + 6) % 7; // Mon=0
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const loc = locale === "kk" ? "kk-KZ" : "ru-RU";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekdays =
    locale === "kk"
      ? ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"]
      : ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={hallId}
          onChange={(e) => setHallId(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          aria-label={labels.selectHall}
        >
          {halls.map((h) => (
            <option key={h.id} value={h.id}>
              {getLocalizedField(h, "name", locale)}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
            aria-label="prev"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-40 text-center font-semibold capitalize text-gray-900">
            {cursor.toLocaleDateString(loc, labels.monthFormat)}
          </div>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
            aria-label="next"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
        {weekdays.map((w) => (
          <div key={w} className="py-2">{w}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square" />;
          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const isPast = d < today;
          const isBusy = busy.has(iso);
          return (
            <div
              key={i}
              className={
                "relative grid aspect-square place-items-center rounded-lg text-sm transition " +
                (isPast
                  ? "bg-gray-50 text-gray-300"
                  : isBusy
                    ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                    : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100")
              }
              title={isBusy ? labels.busy : labels.free}
            >
              {d.getDate()}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-emerald-200" /> {labels.free}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-red-200" /> {labels.busy}
        </span>
        {loading && <span className="ml-auto text-gray-400">…</span>}
      </div>
    </div>
  );
}
