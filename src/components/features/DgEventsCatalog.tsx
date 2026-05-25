"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { pluralByLocale } from "@/lib/plural";
import DgIcon from "@/components/layout/DgIcon";

export interface DgEvent {
  id: string;
  href: string;
  title: string;
  image: string;
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

  const filtered = useMemo(
    () =>
      items.filter(
        (e) =>
          (month === ALL || e.monthLong === month) &&
          (hall === ALL || e.hall === hall) &&
          (type === ALL || e.type === type) &&
          (!query.trim() || e.title.toLowerCase().includes(query.toLowerCase()))
      ),
    [items, month, hall, type, query, ALL]
  );

  const reset = () => {
    setMonth(ALL);
    setHall(ALL);
    setType(ALL);
    setQuery("");
  };

  const chip = (val: string, active: string, set: (v: string) => void) => (
    <button key={val} className={"filter-chip" + (val === active ? " active" : "")} onClick={() => set(val)}>
      {val}
    </button>
  );

  return (
    <>
      <div className="dg-wrap">
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
