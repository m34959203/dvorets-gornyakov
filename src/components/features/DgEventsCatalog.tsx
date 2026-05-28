"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

// Локализованные массивы — НЕ Intl: в Docker-контейнере урезанный ICU отдаёт
// английские дни/«M05» вместо kk/ru (поэтому весь проект использует свои массивы).
const RAIL_DOW = {
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  kk: ["Жс", "Дс", "Сс", "Ср", "Бс", "Жм", "Сб"],
};
const RAIL_MON = {
  ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
  kk: ["Қаң", "Ақп", "Нау", "Сәу", "Мам", "Мау", "Шіл", "Там", "Қыр", "Қаз", "Қар", "Жел"],
};

// Дни от «сегодня» по Asia/Almaty до конца окна «текущий + 2 месяца» (синхрон с чипами).
// Считаем от UTC-полудня, чтобы не зависеть от TZ клиента и DST.
function buildRail(locale: Locale): RailDay[] {
  const lng = locale === "kk" ? "kk" : "ru";
  const dow = RAIL_DOW[lng];
  const mon = RAIL_MON[lng];
  const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Almaty" }).format(new Date());
  const [Y, M, D] = todayIso.split("-").map(Number);
  const DAY = 86400000;
  const start = Date.UTC(Y, M - 1, D, 12);
  const end = Date.UTC(Y, M - 1 + 3, 1, 12); // 1-е число месяца, следующего за окном
  const out: RailDay[] = [];
  let first = true;
  for (let t = start; t < end; t += DAY) {
    const d = new Date(t);
    out.push({
      iso: d.toISOString().slice(0, 10),
      day: String(d.getUTCDate()),
      dow: dow[d.getUTCDay()],
      mon: mon[d.getUTCMonth()],
      weekend: d.getUTCDay() === 0 || d.getUTCDay() === 6,
      firstOfMonth: d.getUTCDate() === 1 || first,
    });
    first = false;
  }
  return out;
}

const GRID_WEEKDAYS = {
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  kk: ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"],
};

interface GridCell { day: number; iso: string; today: boolean; }
interface MonthGrid { label: string; year: number; cells: (GridCell | null)[]; }

// Сетки 3 месяцев окна (текущий + 2). monthWindow — длинные названия для заголовков.
function buildGrids(monthWindow: string[]): MonthGrid[] {
  const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Almaty" }).format(new Date());
  const [Y, M] = todayIso.split("-").map(Number);
  const grids: MonthGrid[] = [];
  for (let k = 0; k < 3; k++) {
    const first = new Date(Date.UTC(Y, M - 1 + k, 1, 12));
    const y = first.getUTCFullYear();
    const mIdx = first.getUTCMonth();
    const daysInMonth = new Date(Date.UTC(y, mIdx + 1, 0, 12)).getUTCDate();
    const startWeekday = (first.getUTCDay() + 6) % 7; // понедельник = 0
    const cells: (GridCell | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${y}-${String(mIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, iso, today: iso === todayIso });
    }
    grids.push({ label: monthWindow[k] ?? "", year: y, cells });
  }
  return grids;
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
  /** Окно месяцев для фильтра: текущий + 2 следующих (длинные локализованные названия). */
  monthWindow: string[];
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

function Chip({ val, active, onSelect }: { val: string; active: string; onSelect: (v: string) => void }) {
  return (
    <button className={"filter-chip" + (val === active ? " active" : "")} onClick={() => onSelect(val)}>
      {val}
    </button>
  );
}

export default function DgEventsCatalog({ locale, items, monthWindow }: Props) {
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);
  const ALL = T("Барлығы", "Все");

  // Текущий + 2 следующих месяца (скользящее окно), а не то, что попало в данные.
  const months = useMemo(() => [ALL, ...monthWindow], [monthWindow, ALL]);
  const halls = useMemo(() => [ALL, ...distinct(items.map((e) => e.hall))], [items, ALL]);
  const types = useMemo(() => [ALL, ...distinct(items.map((e) => e.type))], [items, ALL]);

  const [month, setMonth] = useState(ALL);
  const [hall, setHall] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [query, setQuery] = useState("");
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "grid" | "rail">("list");

  const rail = useMemo(() => buildRail(locale), [locale]);
  const grids = useMemo(() => buildGrids(monthWindow), [monthWindow]);
  const weekdays = locale === "kk" ? GRID_WEEKDAYS.kk : GRID_WEEKDAYS.ru;
  const hasEvent = useMemo(() => new Set(items.map((e) => e.iso)), [items]);
  const railRef = useRef<HTMLDivElement>(null);
  // Индексы первых дней месяцев в ленте (для прокрутки по клику на чип месяца).
  const monthStarts = useMemo(
    () => rail.map((r, i) => (r.firstOfMonth ? i : -1)).filter((i) => i >= 0),
    [rail]
  );

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
  const scrollRailToIdx = (idx: number) => {
    const track = railRef.current;
    const child = track?.children[idx] as HTMLElement | undefined;
    if (track && child) track.scrollTo({ left: Math.max(0, child.offsetLeft - 40), behavior: "smooth" });
  };

  // Клик по месяцу: фильтруем + прокручиваем ленту к 1-му числу этого месяца (синхрон).
  const pickMonth = (m: string) => {
    setMonth(m);
    const o = monthWindow.indexOf(m);
    if (view === "rail" && o >= 0 && monthStarts[o] != null) scrollRailToIdx(monthStarts[o]);
  };

  // Переключение вида. На «Список» сбрасываем выбранный день (он выбирается только в сетке/ленте).
  const changeView = (v: "list" | "grid" | "rail") => {
    setView(v);
    if (v === "list") setSelectedIso(null);
  };
  const VIEWS: { id: "list" | "grid" | "rail"; kk: string; ru: string }[] = [
    { id: "list", kk: "Тізім", ru: "Список" },
    { id: "grid", kk: "Ай торы", ru: "Сетка месяца" },
    { id: "rail", kk: "Күндер", ru: "Лента дат" },
  ];

  return (
    <>
      <div className="dg-wrap">
        <div className="dg-controls">
        {/* Переключатель вида */}
        <div className="dg-view" role="tablist" aria-label={T("Көрініс", "Вид")}>
          {VIEWS.map((v) => (
            <button
              type="button"
              key={v.id}
              role="tab"
              aria-selected={view === v.id}
              className={"dg-view-btn" + (view === v.id ? " active" : "")}
              onClick={() => changeView(v.id)}
            >
              {T(v.kk, v.ru)}
            </button>
          ))}
        </div>

        {/* Лента дат */}
        {view === "rail" && (
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
        )}

        {/* Сетка месяца */}
        {view === "grid" && (
          <div className="dg-grids">
            {grids.map((g) => (
              <div className="cal" key={g.label + g.year}>
                <div className="cal-head">
                  <div>
                    <div className="cal-month">{g.label}</div>
                    <div className="cal-year" style={{ marginTop: 4 }}>{g.year}</div>
                  </div>
                </div>
                <div className="cal-grid" role="grid">
                  {weekdays.map((d) => (
                    <div key={d} className="cal-dow">{d}</div>
                  ))}
                  {g.cells.map((c, i) =>
                    c === null ? (
                      <div key={i} className="cal-cell dim" />
                    ) : (
                      <button
                        type="button"
                        key={c.iso}
                        onClick={() => pickDay(c.iso)}
                        aria-pressed={selectedIso === c.iso}
                        className={
                          "cal-cell" +
                          (c.today ? " today" : "") +
                          (hasEvent.has(c.iso) ? " event" : "") +
                          (selectedIso === c.iso ? " sel" : "")
                        }
                      >
                        {c.day}
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="filters">
          <div className="filter-group">
            <span className="filter-label">{T("Ай", "Месяц")}</span>
            {months.map((m) => (
              <Chip key={m} val={m} active={month} onSelect={pickMonth} />
            ))}
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
              {halls.map((h) => (
                <Chip key={h} val={h} active={hall} onSelect={setHall} />
              ))}
            </div>
          </div>
        )}
        {types.length > 2 && (
          <div className="filters">
            <div className="filter-group">
              <span className="filter-label">{T("Түрі", "Тип")}</span>
              {types.map((tp) => (
                <Chip key={tp} val={tp} active={type} onSelect={setType} />
              ))}
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
                    <Image src={e.image} alt={e.title} fill sizes="(max-width: 768px) 50vw, 25vw" />
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
