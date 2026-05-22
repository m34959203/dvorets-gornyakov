"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import DgIcon from "./DgIcon";

export interface ClientNavItem {
  id: string;
  href: string;
  label: string;
  target: "_self" | "_blank";
}

interface HeaderClientProps {
  locale: Locale;
  navItems: ClientNavItem[];
}

const LANGS: { code: Locale; label: string }[] = [
  { code: "ru", label: "РУС" },
  { code: "kk", label: "ҚАЗ" },
];

export default function HeaderClient({ locale, navItems }: HeaderClientProps) {
  const [drawer, setDrawer] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const switchLocale = (next: Locale) => {
    const segments = pathname.split("/");
    segments[1] = next;
    return segments.join("/") || `/${next}`;
  };

  const current = LANGS.find((l) => l.code === locale)?.label ?? "РУС";

  return (
    <>
      <nav className="dg-nav" aria-label="Основная навигация">
        {navItems.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            target={n.target}
            rel={n.target === "_blank" ? "noopener noreferrer" : undefined}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <div className="dg-header-right">
        <div className="dg-lang-dd" ref={ddRef}>
          <button
            className={"dg-lang-trigger" + (langOpen ? " open" : "")}
            onClick={(e) => {
              e.stopPropagation();
              setLangOpen((o) => !o);
            }}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
          >
            {current}
            <span className="chev">
              <DgIcon name="chev-d" size={14} />
            </span>
          </button>
          {langOpen && (
            <div className="dg-lang-menu" role="listbox">
              {LANGS.map((l) => (
                <Link
                  key={l.code}
                  href={switchLocale(l.code)}
                  className={l.code === locale ? "active" : ""}
                  onClick={() => setLangOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <button
          className="dg-icon-btn menu"
          onClick={() => setDrawer((d) => !d)}
          aria-label="Меню"
          aria-expanded={drawer}
        >
          <DgIcon name={drawer ? "close" : "menu"} size={18} />
        </button>
      </div>

      <div className={"dg-drawer" + (drawer ? " open" : "")} aria-hidden={!drawer}>
        {navItems.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            target={n.target}
            rel={n.target === "_blank" ? "noopener noreferrer" : undefined}
            onClick={() => setDrawer(false)}
          >
            {n.label}
          </Link>
        ))}
      </div>
    </>
  );
}
