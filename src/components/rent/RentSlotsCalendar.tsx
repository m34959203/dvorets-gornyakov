"use client";

import { useEffect, useMemo, useState } from "react";
import DgIcon from "@/components/layout/DgIcon";

interface Slot {
  hall: string;
  start_time: string;
  end_time: string;
  status: string;
}

const HALLS: { id: "big" | "chamber" | "rehearsal"; kk: string; ru: string; cap: number }[] = [
  { id: "big", kk: "Үлкен зал", ru: "Большой зал", cap: 650 },
  { id: "chamber", kk: "Камералық", ru: "Камерный", cap: 120 },
  { id: "rehearsal", kk: "Жаттығу залы", ru: "Репетиционный", cap: 40 },
];
const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const SLOT_MIN = 60;

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};
const todayIso = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Almaty" }).format(new Date());

const RU_MON = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const KK_MON = ["қаң", "ақп", "нау", "сәу", "мам", "мау", "шіл", "там", "қыр", "қаз", "қар", "жел"];

export default function RentSlotsCalendar({ locale, onlyHall }: { locale: "kk" | "ru"; onlyHall?: "big" | "chamber" | "rehearsal" }) {
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);
  const halls = onlyHall ? HALLS.filter((h) => h.id === onlyHall) : HALLS;
  const [date, setDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => setDate(todayIso()), []);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    fetch(`/api/rent/slots?date=${date}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.data?.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [date]);

  const byHall = useMemo(() => {
    const map = new Map<string, [number, number, string][]>();
    for (const s of slots) {
      const arr = map.get(s.hall) || [];
      arr.push([toMin(s.start_time), toMin(s.end_time), s.status]);
      map.set(s.hall, arr);
    }
    return map;
  }, [slots]);

  const slotState = (hall: string, slot: string): "free" | "pending" | "busy" => {
    const start = toMin(slot);
    const end = start + SLOT_MIN;
    for (const [s, e, status] of byHall.get(hall) || []) {
      if (start < e && end > s) return status === "pending" ? "pending" : "busy";
    }
    return "free";
  };

  const shift = (days: number) => {
    if (!date) return;
    const d = new Date(`${date}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    const iso = d.toISOString().slice(0, 10);
    if (iso >= todayIso()) setDate(iso); // не уходим в прошлое
  };

  const label = useMemo(() => {
    if (!date) return " ";
    const d = new Date(`${date}T12:00:00Z`);
    return `${d.getUTCDate()} ${(locale === "kk" ? KK_MON : RU_MON)[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }, [date, locale]);

  return (
    <div className="dg-slots">
      <div className="dg-slots-head">
        <button onClick={() => shift(-1)} disabled={date <= todayIso()} aria-label={T("Алдыңғы күн", "Предыдущий день")}>
          <DgIcon name="chev-l" size={16} />
        </button>
        <div className="dg-slots-title">
          <h3>{T("Залдардың бос уақыты", "Доступность залов")}</h3>
          <span>{label}</span>
        </div>
        <button onClick={() => shift(1)} aria-label={T("Келесі күн", "Следующий день")}>
          <DgIcon name="chev-r" size={16} />
        </button>
      </div>

      <div className="dg-slots-halls">
        {halls.map((h) => (
          <div className="dg-slots-hall" key={h.id}>
            <div className="dg-slots-hall-top">
              <span className="name">{T(h.kk, h.ru)}</span>
              <span className="cap"><DgIcon name="users" size={13} /> {T("дейін", "до")} {h.cap}</span>
            </div>
            <div className="dg-slots-grid">
              {TIME_SLOTS.map((slot) => {
                const st = slotState(h.id, slot);
                return <span key={slot} className={"dg-slot " + st} title={`${slot} — ${T(st === "free" ? "бос" : st === "pending" ? "күтуде" : "бос емес", st === "free" ? "свободно" : st === "pending" ? "ожидает" : "занято")}`}>{slot}</span>;
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="dg-slots-legend">
        <span><i className="free" />{T("Бос", "Свободно")}</span>
        <span><i className="pending" />{T("Күтуде", "Ожидает")}</span>
        <span><i className="busy" />{T("Бос емес", "Занято")}</span>
        {loading && <span className="dg-slots-loading">…</span>}
      </div>
    </div>
  );
}
