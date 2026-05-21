"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  locale: Locale;
  overlay?: boolean;
}

export default function LanguageSwitcher({ locale, overlay = false }: LanguageSwitcherProps) {
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    return segments.join("/");
  };

  return (
    <div
      className="hidden sm:flex items-center"
      style={{
        border: `1px solid ${overlay ? "rgba(247,241,230,0.4)" : "var(--line)"}`,
        borderRadius: 999,
        padding: 3,
      }}
    >
      <Link
        href={switchLocale("kk")}
        className={cn("transition-colors")}
        style={{
          padding: "5px 12px",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.04em",
          borderRadius: 999,
          textDecoration: "none",
          background: locale === "kk" ? "var(--text)" : "transparent",
          color: locale === "kk" ? "var(--text-light)" : overlay ? "var(--text-light)" : "var(--text)",
        }}
      >
        KZ
      </Link>
      <Link
        href={switchLocale("ru")}
        className={cn("transition-colors")}
        style={{
          padding: "5px 12px",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.04em",
          borderRadius: 999,
          textDecoration: "none",
          background: locale === "ru" ? "var(--text)" : "transparent",
          color: locale === "ru" ? "var(--text-light)" : overlay ? "var(--text-light)" : "var(--text)",
        }}
      >
        RU
      </Link>
    </div>
  );
}
