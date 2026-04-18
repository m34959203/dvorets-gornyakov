"use client";

import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";
import HallForm from "@/components/rent/HallForm";

export default function NewHallPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {locale === "kk" ? "Жаңа зал" : "Новый зал"}
      </h1>
      <HallForm locale={locale} />
    </div>
  );
}
