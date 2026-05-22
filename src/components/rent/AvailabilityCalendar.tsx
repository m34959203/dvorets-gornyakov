"use client";

import { useEffect, useMemo, useState } from "react";
import type { Hall } from "@/lib/rent/types";
import type { Locale } from "@/lib/i18n";
import { getLocalizedField } from "@/lib/i18n";
import DgIcon from "@/components/layout/DgIcon";

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
    <div
      style={{
        background: "var(--dg-bg-2)",
        border: "1px solid var(--dg-hair)",
        borderRadius: "var(--dg-radius)",
        padding: 24,
      }}
    >
      {/* Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        {halls.length > 1 && (
          <select
            value={hallId}
            onChange={(e) => setHallId(e.target.value)}
            aria-label={labels.selectHall}
            style={{ flex: 1, minWidth: 160 }}
          >
            {halls.map((h) => (
              <option key={h.id} value={h.id}>
                {getLocalizedField(h as unknown as Record<string, unknown>, "name", locale)}
              </option>
            ))}
          </select>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            aria-label="prev"
            style={{
              background: "transparent",
              border: "1px solid var(--dg-hair-2)",
              borderRadius: 2,
              padding: 6,
              cursor: "pointer",
              color: "var(--dg-text)",
              display: "grid",
              placeItems: "center",
              transition: "border-color .15s, color .15s",
            }}
          >
            <DgIcon name="chev-l" size={16} />
          </button>
          <div
            style={{
              minWidth: 160,
              textAlign: "center",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "capitalize",
              color: "var(--dg-text)",
            }}
          >
            {cursor.toLocaleDateString(loc, labels.monthFormat)}
          </div>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            aria-label="next"
            style={{
              background: "transparent",
              border: "1px solid var(--dg-hair-2)",
              borderRadius: 2,
              padding: 6,
              cursor: "pointer",
              color: "var(--dg-text)",
              display: "grid",
              placeItems: "center",
              transition: "border-color .15s, color .15s",
            }}
          >
            <DgIcon name="chev-r" size={16} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        {weekdays.map((w) => (
          <div
            key={w}
            style={{
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--dg-text-3)",
              paddingBlock: 6,
            }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {days.map((d, i) => {
          if (!d) return <div key={i} style={{ aspectRatio: "1" }} />;
          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const isPast = d < today;
          const isBusy = busy.has(iso);

          const bg = isPast
            ? "transparent"
            : isBusy
            ? "rgba(248,113,113,0.12)"
            : "rgba(52,211,153,0.10)";
          const color = isPast
            ? "var(--dg-text-3)"
            : isBusy
            ? "#f87171"
            : "#34d399";
          const ring = isPast
            ? "none"
            : isBusy
            ? "1px solid rgba(248,113,113,0.3)"
            : "1px solid rgba(52,211,153,0.25)";

          return (
            <div
              key={i}
              title={isBusy ? labels.busy : labels.free}
              style={{
                aspectRatio: "1",
                display: "grid",
                placeItems: "center",
                borderRadius: 3,
                fontSize: 12,
                background: bg,
                color,
                border: ring,
                transition: "background .15s",
              }}
            >
              {d.getDate()}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 16,
          fontSize: 11,
          color: "var(--dg-text-3)",
          letterSpacing: "0.1em",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "rgba(52,211,153,0.3)",
              flexShrink: 0,
            }}
          />
          {labels.free}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "rgba(248,113,113,0.3)",
              flexShrink: 0,
            }}
          />
          {labels.busy}
        </span>
        {loading && (
          <span style={{ marginLeft: "auto", color: "var(--dg-text-3)", fontSize: 18, lineHeight: 1 }}>
            …
          </span>
        )}
      </div>
    </div>
  );
}
