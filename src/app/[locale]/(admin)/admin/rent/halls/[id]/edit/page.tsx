"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";
import HallForm from "@/components/rent/HallForm";
import type { Hall } from "@/lib/rent/types";

export default function EditHallPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  const id = params.id as string;

  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    fetch(`/api/admin/rent/halls/${id}`)
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) setErr(body.error || "Ошибка");
        else setHall(body.data?.hall ?? null);
      })
      .catch(() => setErr("Ошибка сети"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {locale === "kk" ? "Залды өңдеу" : "Редактирование зала"}
      </h1>
      {err && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {loading ? <p className="text-gray-400">…</p> : hall ? <HallForm locale={locale} initial={hall} /> : <p className="text-gray-500">—</p>}
    </div>
  );
}
