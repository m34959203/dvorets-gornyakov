"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { pluralByLocale } from "@/lib/plural";
import DgIcon from "@/components/layout/DgIcon";

export interface DgClub {
  id: string;
  href: string;
  name: string;
  direction: string;
  ageGroup: string; // исходная строка ("7-18", "18+")
  ageMin: number;
  ageMax: number;
  teacher: string;
  description: string;
}

interface Props {
  locale: Locale;
  items: DgClub[];
}

const AGES = [
  { id: "all", min: 0, max: 99, kk: "Барлық жастар", ru: "Все возрасты" },
  { id: "3-6", min: 3, max: 6, kk: "3–6 жас", ru: "3–6 лет" },
  { id: "7-10", min: 7, max: 10, kk: "7–10 жас", ru: "7–10 лет" },
  { id: "11-14", min: 11, max: 14, kk: "11–14 жас", ru: "11–14 лет" },
  { id: "15-18", min: 15, max: 18, kk: "15–18 жас", ru: "15–18 лет" },
  { id: "18+", min: 18, max: 99, kk: "18+ жас", ru: "18+ лет" },
];

const DIRS = [
  { id: "all", kk: "Барлық бағыттар", ru: "Все направления" },
  { id: "vocal", kk: "Вокал", ru: "Вокал" },
  { id: "dance", kk: "Би", ru: "Танцы" },
  { id: "music", kk: "Музыка", ru: "Музыка" },
  { id: "art", kk: "Сурет", ru: "Рисование" },
  { id: "theater", kk: "Театр", ru: "Театр" },
  { id: "sport", kk: "Спорт", ru: "Спорт" },
  { id: "general", kk: "Жалпы", ru: "Общее" },
];

export default function DgClubsCatalog({ locale, items }: Props) {
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);
  const dirLabel = (id: string) => {
    const d = DIRS.find((x) => x.id === id);
    return d ? T(d.kk, d.ru) : id;
  };

  const sp = useSearchParams();
  const initCat = sp.get("cat") || sp.get("direction") || "all";
  const [cat, setCat] = useState(DIRS.some((d) => d.id === initCat) ? initCat : "all");
  const [age, setAge] = useState("all");
  const [query, setQuery] = useState("");

  // Показываем только направления, реально присутствующие в данных (+ «Все»)
  const presentDirs = useMemo(() => {
    const present = new Set(items.map((c) => c.direction));
    return DIRS.filter((d) => d.id === "all" || present.has(d.id));
  }, [items]);

  const ageRange = AGES.find((a) => a.id === age)!;
  const filtered = useMemo(
    () =>
      items.filter(
        (c) =>
          (cat === "all" || c.direction === cat) &&
          (age === "all" || (c.ageMax >= ageRange.min && c.ageMin <= ageRange.max)) &&
          (!query.trim() || c.name.toLowerCase().includes(query.toLowerCase()))
      ),
    [items, cat, age, query, ageRange]
  );

  const reset = () => {
    setCat("all");
    setAge("all");
    setQuery("");
  };

  return (
    <>
      <div className="dg-wrap">
        <div className="filters">
          <div className="filter-group">
            <span className="filter-label">{T("Бағыт", "Направление")}</span>
            {presentDirs.map((d) => (
              <button key={d.id} className={"filter-chip" + (cat === d.id ? " active" : "")} onClick={() => setCat(d.id)}>
                {T(d.kk, d.ru)}
              </button>
            ))}
          </div>
          <div className="filter-search">
            <DgIcon name="search" size={14} />
            <input
              type="search"
              value={query}
              placeholder={T("Үйірмелерден іздеу…", "Поиск кружков…")}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={T("Үйірмелерді іздеу", "Поиск кружков")}
            />
          </div>
        </div>
        <div className="filters">
          <div className="filter-group">
            <span className="filter-label">{T("Жас", "Возраст")}</span>
            {AGES.map((a) => (
              <button key={a.id} className={"filter-chip" + (age === a.id ? " active" : "")} onClick={() => setAge(a.id)}>
                {T(a.kk, a.ru)}
              </button>
            ))}
          </div>
        </div>
        <div className="results-count">
          {T("Табылды", "Найдено")} <strong>{filtered.length}</strong>{" "}
          {pluralByLocale(locale === "kk" ? "kk" : "ru", filtered.length, {
            ru: ["кружок", "кружка", "кружков"],
            kk: "үйірме",
          })}
        </div>
      </div>

      <section className="section" id="grid" style={{ borderTop: 0, paddingTop: 12 }}>
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
            <div className="clubs-grid">
              {filtered.map((c) => (
                <Link className="club" key={c.id} href={c.href}>
                  <div className="club-top">
                    <div className="club-cat">{dirLabel(c.direction)}</div>
                    <div className="club-age">{c.ageGroup}{T(" жас", " лет")}</div>
                  </div>
                  <h3>{c.name}</h3>
                  <div className="club-meta">
                    {c.teacher && <div className="row"><DgIcon name="user" size={13} /> {c.teacher}</div>}
                    <div className="row"><DgIcon name="coin" size={13} /> <span className="free">{T("Тегін", "Бесплатно")}</span></div>
                  </div>
                  <span className="club-cta">{T("Жазылу", "Записаться")} <DgIcon name="arrow" size={11} /></span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
