"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { pluralByLocale } from "@/lib/plural";
import DgIcon from "@/components/layout/DgIcon";

interface RailDay {
  iso: string;       // YYYY-MM-DD
  day: string;       // число
  dow: string;       // короткий день недели
  mon: string;       // короткий месяц
  weekend: boolean;
  firstOfMonth: boolean;
}

// 120 дней начиная с «сегодня» по Asia/Almaty. Всё считаем от UTC-полудня
// ISO-даты, чтобы не зависеть от таймзоны клиента (см. iso событий — тоже Алматы).
function buildRail(locale: Locale): RailDay[] {
  const loc = locale === "kk" ? "kk-KZ" : "ru-RU";
  const dowFmt = new Intl.DateTimeFormat(loc, { timeZone: "UTC", weekday: "short" });
  const monFmt = new Intl.DateTimeFormat(loc, { timeZone: "UTC", month: "short" });
  const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Almaty" }).format(new Date());
  const [Y, M, D] = todayIso.split("-").map(Number);
  const out: RailDay[] = [];
  for (let i = 0; i < 120; i++) {
    const d = new Date(Date.UTC(Y, M - 1, D + i, 12));
    const iso = d.toISOString().slice(0, 10);
    const wd = d.getUTCDay();
    const dayNum = String(d.getUTCDate());
    out.push({
      iso,
      day: dayNum,
      dow: dowFmt.format(d).replace(/\.$/, ""),
      mon: monFmt.format(d).replace(/\.$/, ""),
      weekend: wd === 0 || wd === 6,
      firstOfMonth: d.getUTCDate() === 1 || i === 0,
    });
  }
  return out;
}

export interface DgEvent {
  id: string;
  href: string;
  title: string;
  image: string;
  iso: string; // YYYY-MM-DD (Asia/Almaty) — ключ для фильтра по дню
  day: string;
  mon: string; // короткий месяц uppercase (для карточки)
  monthLong: string; // длинный месяц (для фильтра)
  year: string;
  time: string;
  hall: string;
  type: string;
  free: boolean;
  price: string;
  tag?: string;
}

interface Props {
  locale: Locale;
  items: DgEvent[];
}

function distinct(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (v && !seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

export default function DgEventsCatalog({ locale, items }: Props) {
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);
  const ALL = T("Барлығы", "Все");

  const months = useMemo(() => [ALL, ...distinct(items.map((e) => e.monthLong))], [items, ALL]);
  const halls = useMemo(() => [ALL, ...distinct(items.map((e) => e.hall))], [items, ALL]);
  const types = useMemo(() => [ALL, ...distinct(items.map((e) => e.type))], [items, ALL]);

  const [month, setMonth] = useState(ALL);
  const [hall, setHall] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [query, setQuery] = useState("");
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const rail = useMemo(() => buildRail(locale), [locale]);
  const hasEvent = useMemo(() => new Set(items.map((e) => e.iso)), [items]);
  const railRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      items.filter(
        (e) =>
          (!selectedIso || e.iso === selectedIso) &&
          (month === ALL || e.monthLong === month) &&
          (hall === ALL || e.hall === hall) &&
          (type === ALL || e.type === type) &&
          (!query.trim() || e.title.toLowerCase().includes(query.toLowerCase()))
      ),
    [items, selectedIso, month, hall, type, query, ALL]
  );

  const reset = () => {
    setMonth(ALL);
    setHall(ALL);
    setType(ALL);
    setQuery("");
    setSelectedIso(null);
  };

  const pickDay = (iso: string) => setSelectedIso((cur) => (cur === iso ? null : iso));
  const scrollRail = (dir: -1 | 1) =>
    railRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  const chip = (val: string, active: string, set: (v: string) => void) => (
    <button key={val} className={"filter-chip" + (val === active ? " active" : "")} onClick={() => set(val)}>
      {val}
    </button>
  );

  return (
    <>
      <div className="dg-wrap">
        {/* Лента дат */}
        <div className="dg-daterail">
          <button
            type="button"
            className="dg-daterail-arrow l"
            onClick={() => scrollRail(-1)}
            aria-label={T("Артқа", "Назад")}
          >
            <DgIcon name="chev-l" size={16} />
          </button>
          <div className="dg-daterail-track" ref={railRef} role="group" aria-label={T("Күні бойынша", "По дате")}>
            {rail.map((d, i) => (
              <button
                type="button"
                key={d.iso}
                onClick={() => pickDay(d.iso)}
                aria-pressed={selectedIso === d.iso}
                className={
                  "dg-date" +
                  (selectedIso === d.iso ? " sel" : "") +
                  (i === 0 ? " today" : "") +
                  (d.weekend ? " weekend" : "") +
                  (hasEvent.has(d.iso) ? " has" : "")
                }
              >
                <span className="dow">{d.firstOfMonth ? d.mon : d.dow}</span>
                <span className="num">{d.day}</span>
                <span className="mon">{d.firstOfMonth ? "" : d.mon}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="dg-daterail-arrow r"
            onClick={() => scrollRail(1)}
            aria-label={T("Алға", "Вперёд")}
          >
            <DgIcon name="chev-r" size={16} />
          </button>
        </div>

        <div className="filters">
          <div className="filter-group">
            <span className="filter-label">{T("Ай", "Месяц")}</span>
            {months.map((m) => chip(m, month, setMonth))}
          </div>
          <div className="filter-search">
            <DgIcon name="search" size={14} />
            <input
              type="search"
              value={query}
              placeholder={T("Афишадан іздеу…", "Поиск по афише…")}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={T("Іс-шараларды іздеу", "Поиск событий")}
            />
          </div>
        </div>
        {halls.length > 2 && (
          <div className="filters">
            <div className="filter-group">
              <span className="filter-label">{T("Зал", "Зал")}</span>
              {halls.map((h) => chip(h, hall, setHall))}
            </div>
          </div>
        )}
        {types.length > 2 && (
          <div className="filters">
            <div className="filter-group">
              <span className="filter-label">{T("Түрі", "Тип")}</span>
              {types.map((tp) => chip(tp, type, setType))}
            </div>
          </div>
        )}
        <div className="results-count">
          {T("Табылды", "Найдено")} <strong>{filtered.length}</strong>{" "}
          {pluralByLocale(locale === "kk" ? "kk" : "ru", filtered.length, {
            ru: ["событие", "события", "событий"],
            kk: "іс-шара",
          })}
        </div>
      </div>

      <section className="section section--light" id="grid" style={{ borderTop: 0, paddingTop: 12 }}>
        <div className="dg-wrap">
          {filtered.length === 0 ? (
            <div className="dg-empty">
              <DgIcon name="search" size={32} stroke={1} />
              <div className="msg">{T("Сұранысыңыз бойынша ештеңе табылмады", "По вашему запросу ничего не найдено")}</div>
              <button className="filter-chip" onClick={reset}>
                {T("Сүзгілерді тазалау", "Сбросить фильтры")}
              </button>
            </div>
          ) : (
            <div className="posters">
              {filtered.map((e) => (
                <article className="poster" key={e.id}>
                  <div className="poster-media">
                    <img src={e.image} alt={e.title} />
                    {e.tag && <div className="poster-tag">{e.tag}</div>}
                  </div>
                  <h3 className="poster-title">{e.title}</h3>
                  <ul className="poster-meta">
                    <li><DgIcon name="calendar" size={13} /> {e.day} {e.mon} {e.year}, {e.time}</li>
                    <li><DgIcon name="pin" size={13} /> {e.hall}</li>
                    <li><DgIcon name="coin" size={13} /> <span className={e.free ? "price" : ""}>{e.price}</span></li>
                  </ul>
                  <Link href={e.href} className="poster-cta">
                    {T("Толығырақ", "Подробнее")} <DgIcon name="arrow" size={11} />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
