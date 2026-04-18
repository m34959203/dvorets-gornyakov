"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";
import type { Hall } from "@/lib/rent/types";

export default function AdminHallsListPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/rent/halls");
      const body = await r.json();
      if (!r.ok) setErr(body.error || "Error");
      else setHalls(body.data?.halls ?? []);
    } catch {
      setErr("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Удалить зал? Это необратимо.")) return;
    const r = await fetch(`/api/admin/rent/halls/${id}`, { method: "DELETE" });
    const body = await r.json();
    if (!r.ok) {
      alert(body.error);
      return;
    }
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "kk" ? "Залдарды басқару" : "Управление залами"}
        </h1>
        <Link href={`/${locale}/admin/rent/halls/new`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
          + {locale === "kk" ? "Жаңа зал" : "Новый зал"}
        </Link>
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Slug</Th>
              <Th>{locale === "kk" ? "Аты" : "Название (RU)"}</Th>
              <Th>{locale === "kk" ? "Сыйымдылық" : "Вместимость"}</Th>
              <Th>{locale === "kk" ? "Бастапқы баға" : "От"}</Th>
              <Th>{locale === "kk" ? "Күйі" : "Статус"}</Th>
              <Th>{""}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">…</td></tr>
            ) : halls.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">—</td></tr>
            ) : (
              halls.map((h) => (
                <tr key={h.id}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{h.slug}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{h.name_ru}</td>
                  <td className="px-4 py-3 text-gray-700">{h.capacity}</td>
                  <td className="px-4 py-3 text-gray-700">{h.event_price_from.toLocaleString("ru-RU")} ₸</td>
                  <td className="px-4 py-3">
                    <span className={"inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium " +
                      (h.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700")}>
                      {h.is_active ? "active" : "inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/${locale}/admin/rent/halls/${h.id}/edit`}
                          className="mr-3 text-primary hover:underline">
                      {locale === "kk" ? "Өңдеу" : "Править"}
                    </Link>
                    <button onClick={() => remove(h.id)} className="text-red-600 hover:underline">
                      {locale === "kk" ? "Жою" : "Удалить"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">{children}</th>;
}
