"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

interface ScheduleItem {
  d: string;
  m: string;
  wd: string;
  title: string;
  time: string;
  hall: string;
  price: string;
}

interface EtnoScheduleProps {
  locale: Locale;
  items: ScheduleItem[];
  monthLabel: string; // напр. "Наурыз 2026" / "Март 2026"
  eventDays: number[]; // дни месяца, в которых есть события
  daysInMonth?: number;
  startWeekday?: number; // 0=Дс (понедельник), 6=Жс (воскресенье)
}

export default function EtnoSchedule({
  locale,
  items,
  monthLabel,
  eventDays,
  daysInMonth = 31,
  startWeekday = 0,
}: EtnoScheduleProps) {
  const [selectedDay, setSelectedDay] = useState<number>(eventDays[0] ?? 1);
  const weekdays = locale === "kk"
    ? ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"]
    : ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const calendarCells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (calendarCells.length < 42) calendarCells.push(null);

  return (
    <section
      style={{
        background: "var(--emerald-dark)",
        color: "var(--text-light)",
        padding: "96px 64px",
        position: "relative",
      }}
      className="etno-schedule"
    >
      {/* Заголовок */}
      <div className="section-kicker" style={{ marginBottom: 48 }}>
        <div className="bar" />
        <div>
          <div className="eyebrow" style={{ color: "var(--ochre)" }}>
            {locale === "kk" ? "Айлық кесте" : "Месячное расписание"}
          </div>
          <h2 style={{ color: "var(--text-light)", marginTop: 10, fontSize: 52 }}>
            {locale === "kk" ? "Айдағы іс-шаралар" : "Расписание на месяц"}
          </h2>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: 56,
          alignItems: "flex-start",
        }}
        className="etno-schedule-grid"
      >
        {/* Слайдер карточек */}
        <div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}
            className="etno-schedule-cards"
          >
            {items.slice(0, 4).map((it, i) => (
              <div
                key={i}
                style={{
                  background: i === 0 ? "var(--ochre)" : "rgba(247,241,230,0.06)",
                  color: i === 0 ? "var(--text)" : "var(--text-light)",
                  border: i === 0 ? "none" : "1px solid rgba(247,241,230,0.14)",
                  borderRadius: 14,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  minHeight: 280,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-head)",
                      fontSize: 56,
                      fontWeight: 800,
                      letterSpacing: "-0.05em",
                      lineHeight: 0.9,
                    }}
                  >
                    {it.d}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      marginTop: 6,
                      opacity: i === 0 ? 0.7 : 0.85,
                    }}
                  >
                    {it.m} · {it.wd}
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    fontFamily: "var(--font-head)",
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: 1.25,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {it.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    opacity: i === 0 ? 0.7 : 0.7,
                    letterSpacing: "0.08em",
                  }}
                >
                  {it.time} · {it.hall}
                </div>
                <button
                  style={{
                    background: i === 0 ? "var(--text)" : "var(--ochre)",
                    color: i === 0 ? "var(--text-light)" : "var(--text)",
                    border: "none",
                    borderRadius: 999,
                    padding: "11px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-head)",
                    letterSpacing: "0.02em",
                    marginTop: "auto",
                  }}
                >
                  {locale === "kk" ? "Билет сатып алу →" : "Купить билет →"}
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            {["‹", "›"].map((s) => (
              <button
                key={s}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "1px solid rgba(247,241,230,0.3)",
                  background: "transparent",
                  color: "var(--text-light)",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
            <div
              style={{
                marginLeft: "auto",
                alignSelf: "center",
                fontSize: 12,
                opacity: 0.6,
                letterSpacing: "0.1em",
              }}
            >
              01 / {Math.max(1, Math.ceil(items.length / 4))}
            </div>
          </div>
        </div>

        {/* Календарь */}
        <div
          style={{
            background: "rgba(247,241,230,0.04)",
            border: "1px solid rgba(247,241,230,0.12)",
            borderRadius: 18,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-head)",
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "-0.02em",
              }}
            >
              {monthLabel}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["‹", "›"].map((s) => (
                <button
                  key={s}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "transparent",
                    border: "1px solid rgba(247,241,230,0.3)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
              marginBottom: 8,
            }}
          >
            {weekdays.map((w) => (
              <div
                key={w}
                style={{
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textAlign: "center",
                  opacity: 0.5,
                  padding: "6px 0",
                }}
              >
                {w}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {calendarCells.map((d, i) => {
              if (!d) return <div key={i} style={{ aspectRatio: "1" }} />;
              const hasEvent = eventDays.includes(d);
              const isSelected = d === selectedDay;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(d)}
                  style={{
                    aspectRatio: "1",
                    background: isSelected
                      ? "var(--ochre)"
                      : hasEvent
                      ? "rgba(212,168,67,0.18)"
                      : "transparent",
                    color: isSelected ? "var(--text)" : "var(--text-light)",
                    border: "none",
                    borderRadius: "50%",
                    fontFamily: "var(--font-head)",
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: 14,
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {d}
                  {hasEvent && !isSelected && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 4,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 4,
                        height: 4,
                        background: "var(--ochre)",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
