"use client";

import { useMemo, useState } from "react";
import PosterCard, { type Poster } from "./PosterCard";
import type { Locale } from "@/lib/i18n";
import { pluralByLocale } from "@/lib/plural";

export interface CatalogItem extends Poster {
  cat: string;
}

interface EventsCatalogProps {
  locale: Locale;
  items: CatalogItem[];
  cats: string[]; // первая категория = "Все/Барлығы"
  perPage?: number;
}

export default function EventsCatalog({ locale, items, cats, perPage = 12 }: EventsCatalogProps) {
  const [active, setActive] = useState(cats[0]);
  const [page, setPage] = useState(1);

  const visible = useMemo(
    () => (active === cats[0] ? items : items.filter((p) => p.cat === active)),
    [active, items, cats]
  );

  const pages = Math.max(1, Math.ceil(visible.length / perPage));
  const pageItems = visible.slice((page - 1) * perPage, page * perPage);

  return (
    <section style={{ padding: "72px 64px 96px" }} className="etno-events-catalog">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 36,
          alignItems: "center",
        }}
      >
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => {
              setActive(c);
              setPage(1);
            }}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: `1px solid ${active === c ? "var(--emerald)" : "var(--line)"}`,
              background: active === c ? "var(--emerald)" : "transparent",
              color: active === c ? "var(--text-light)" : "var(--text)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            {c}
          </button>
        ))}
        <span
          style={{
            marginLeft: "auto",
            alignSelf: "center",
            fontSize: 12,
            color: "var(--text-mute)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {visible.length}{" "}
          {pluralByLocale(locale === "kk" ? "kk" : "ru", visible.length, {
            ru: ["СОБЫТИЕ", "СОБЫТИЯ", "СОБЫТИЙ"],
            kk: "ИС-ШАРА",
          })}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
        }}
        className="etno-posters-grid"
      >
        {pageItems.map((p, i) => (
          <PosterCard
            key={i}
            p={p}
            idx={(page - 1) * perPage + i}
            detailsLabel={locale === "kk" ? "Толығырақ" : "Подробнее"}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginTop: 56,
        }}
      >
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1px solid var(--line)",
            background: "transparent",
            cursor: page === 1 ? "default" : "pointer",
            opacity: page === 1 ? 0.4 : 1,
          }}
        >
          ‹
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: p === page ? "var(--text)" : "transparent",
              color: p === page ? "var(--text-light)" : "var(--text)",
              fontFamily: "var(--font-head)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page === pages}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1px solid var(--line)",
            background: "transparent",
            cursor: page === pages ? "default" : "pointer",
            opacity: page === pages ? 0.4 : 1,
          }}
        >
          ›
        </button>
      </div>
    </section>
  );
}
