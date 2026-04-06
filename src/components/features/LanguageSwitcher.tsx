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
    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
      <Link
        href={switchLocale("kk")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          locale === "kk"
            ? "bg-white text-primary shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        KZ
      </Link>
      <Link
        href={switchLocale("ru")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          locale === "ru"
            ? "bg-white text-primary shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        RU
      </Link>
    </div>
  );
}
