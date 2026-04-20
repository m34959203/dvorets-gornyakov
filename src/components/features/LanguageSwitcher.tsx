"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  locale: Locale;
}

export default function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    return segments.join("/");
  };

  return (
    <div className="flex items-center bg-[color:var(--cream-2)] rounded-full p-[3px]">
      <Link
        href={switchLocale("kk")}
        className={cn(
          "px-3 py-1.5 text-[13px] font-semibold rounded-full transition-colors",
          locale === "kk"
            ? "bg-[color:var(--navy)] text-white"
            : "text-[color:var(--muted)] hover:text-[color:var(--navy)]"
        )}
      >
        KZ
      </Link>
      <Link
        href={switchLocale("ru")}
        className={cn(
          "px-3 py-1.5 text-[13px] font-semibold rounded-full transition-colors",
          locale === "ru"
            ? "bg-[color:var(--navy)] text-white"
            : "text-[color:var(--muted)] hover:text-[color:var(--navy)]"
        )}
      >
        RU
      </Link>
    </div>
  );
}
