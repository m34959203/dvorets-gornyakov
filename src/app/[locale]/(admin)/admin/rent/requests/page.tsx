"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";
import type { RentalRequestWithHall, RentalStatus } from "@/lib/rent/types";

const STATUSES: RentalStatus[] = ["new", "contacted", "confirmed", "rejected", "completed"];

const STATUS_LABELS: Record<RentalStatus, { kk: string; ru: string }> = {
  new: { kk: "Жаңа", ru: "Новая" },
  contacted: { kk: "Хабарласқан", ru: "В работе" },
  confirmed: { kk: "Расталған", ru: "Подтверждена" },
  rejected: { kk: "Қабылданбады", ru: "Отклонена" },
  completed: { kk: "Аяқталған", ru: "Завершена" },
};

const STATUS_COLORS: Record<RentalStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-gray-200 text-gray-800",
};

export default function AdminRentRequestsPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";

  const [status, setStatus] = useState<"" | RentalStatus>("");
  const [items, setItems] = useState<RentalRequestWithHall[]>([]);
  const [selected, setSelected] = useState<RentalRequestWithHall | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const url = `/api/admin/rent/requests${status ? `?status=${status}` : ""}`;
      const r = await fetch(url);
      const body = await r.json();
      if (!r.ok) {
        setErr(body.error || "Ошибка загрузки");
        return;
      }
      setItems(body.data?.requests ?? []);
    } catch {
      setErr("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (next: RentalStatus) => {
    if (!selected) return;
    const r = await fetch(`/api/admin/rent/requests/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next, admin_note: note }),
    });
    const body = await r.json();
    if (!r.ok) {
      alert(body.error || "Ошибка");
      return;
    }
    setSelected(null);
    setNote("");
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {locale === "kk" ? "Жалдау өтінімдері" : "Заявки на аренду"}
      </h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setStatus("")}
          className={"rounded-full px-4 py-1.5 text-sm font-medium " + (status === "" ? "bg-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200")}
        >
          {locale === "kk" ? "Барлығы" : "Все"}
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={"rounded-full px-4 py-1.5 text-sm font-medium " + (status === s ? "bg-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200")}
          >
            {STATUS_LABELS[s][locale]}
          </button>
        ))}
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>{locale === "kk" ? "Мәртебе" : "Статус"}</Th>
              <Th>{locale === "kk" ? "Аты-жөні" : "ФИО / Организация"}</Th>
              <Th>{locale === "kk" ? "Зал" : "Зал"}</Th>
              <Th>{locale === "kk" ? "Күні" : "Дата"}</Th>
              <Th>{locale === "kk" ? "Қонақ" : "Гости"}</Th>
              <Th>{locale === "kk" ? "Байланыс" : "Контакт"}</Th>
              <Th>{locale === "kk" ? "Келді" : "Создано"}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">—</td></tr>
            ) : (
              items.map((it) => (
                <tr
                  key={it.id}
                  onClick={() => { setSelected(it); setNote(it.admin_note || ""); }}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <span className={"inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium " + STATUS_COLORS[it.status]}>
                      {STATUS_LABELS[it.status][locale]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{it.name}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {locale === "kk" ? it.hall_name_kk : it.hall_name_ru}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {it.event_date} {it.time_from}–{it.time_to}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{it.guests}</td>
                  <td className="px-4 py-3 text-gray-700">
                    <div>{it.phone}</div>
                    <div className="text-xs text-gray-500">{it.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(it.created_at).toLocaleDateString(locale === "kk" ? "kk-KZ" : "ru-RU")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1 bg-black/40" />
          <div
            className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {locale === "kk" ? "Өтінім" : "Заявка"} #{selected.id.slice(0, 8)}
              </h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <Row k={locale === "kk" ? "Зал" : "Зал"} v={locale === "kk" ? selected.hall_name_kk : selected.hall_name_ru} />
            <Row k={locale === "kk" ? "Аты-жөні" : "ФИО"} v={selected.name} />
            <Row k="Телефон" v={<a href={`tel:${selected.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">{selected.phone}</a>} />
            <Row k="Email" v={<a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a>} />
            <Row k={locale === "kk" ? "Формат" : "Формат"} v={selected.event_type} />
            <Row k={locale === "kk" ? "Күні/уақыты" : "Дата/время"} v={`${selected.event_date} ${selected.time_from}–${selected.time_to}`} />
            <Row k={locale === "kk" ? "Қонақ" : "Гостей"} v={selected.guests} />
            <Row k={locale === "kk" ? "Жабдық" : "Оборудование"} v={selected.equipment.length ? selected.equipment.join(", ") : "—"} />
            {selected.message && <Row k={locale === "kk" ? "Пікір" : "Комментарий"} v={<span className="whitespace-pre-line">{selected.message}</span>} />}

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-900">
                {locale === "kk" ? "Әкімшінің жазбасы" : "Заметка администратора"}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={s === selected.status}
                  onClick={() => updateStatus(s)}
                  className={
                    "rounded-lg px-3 py-2 text-sm font-medium transition " +
                    (s === selected.status
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : "bg-primary/10 text-primary hover:bg-primary hover:text-white")
                  }
                >
                  {STATUS_LABELS[s][locale]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">{children}</th>;
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-gray-100 py-2 text-sm">
      <div className="w-32 shrink-0 text-gray-500">{k}</div>
      <div className="min-w-0 flex-1 text-gray-900">{v}</div>
    </div>
  );
}
