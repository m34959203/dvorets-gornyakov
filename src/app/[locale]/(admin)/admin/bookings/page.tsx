"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

type Status = "pending" | "approved" | "rejected" | "completed";

interface Booking {
  id: string;
  hall: "big" | "chamber" | "rehearsal";
  date: string;
  start_time: string;
  end_time: string;
  organizer: string;
  phone: string;
  purpose: string;
  attendees: number;
  status: Status;
  source: string;
  locale: string;
  notes_admin: string | null;
  created_at: string;
}

const STATUSES: Status[] = ["pending", "approved", "rejected", "completed"];
const STATUS_LABEL: Record<Status, { kk: string; ru: string }> = {
  pending: { kk: "Күтуде", ru: "Ожидает" },
  approved: { kk: "Бекітілді", ru: "Одобрена" },
  rejected: { kk: "Қабылданбады", ru: "Отклонена" },
  completed: { kk: "Аяқталды", ru: "Завершена" },
};
const STATUS_COLOR: Record<Status, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-gray-200 text-gray-700",
};
const HALL_LABEL: Record<Booking["hall"], { kk: string; ru: string }> = {
  big: { kk: "Үлкен", ru: "Большой" },
  chamber: { kk: "Камералық", ru: "Камерный" },
  rehearsal: { kk: "Жаттығу", ru: "Репетиционный" },
};

export default function AdminBookingsPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const [filter, setFilter] = useState<"" | Status>("pending");
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`/api/admin/bookings${filter ? `?status=${filter}` : ""}`);
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || "error");
      setItems(body.data?.bookings ?? []);
    } catch {
      setErr(T("Жүктеу қатесі", "Ошибка загрузки"));
    } finally {
      setLoading(false);
    }
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id: string, patchBody: { status?: Status; notes_admin?: string }) => {
    const r = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchBody),
    });
    if (r.ok) load();
  };

  const comment = async (b: Booking) => {
    const note = window.prompt(T("Әкімші түсініктемесі", "Комментарий администратора"), b.notes_admin ?? "");
    if (note !== null) patch(b.id, { notes_admin: note });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{T("Зал брондау", "Бронирования залов")}</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilter("")}
            className={`px-3 py-1.5 rounded-md text-sm ${filter === "" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
          >
            {T("Барлығы", "Все")}
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-sm ${filter === s ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
            >
              {T(STATUS_LABEL[s].kk, STATUS_LABEL[s].ru)}
            </button>
          ))}
        </div>
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{err}</div>}
      {loading ? (
        <p className="text-gray-500">{T("Жүктелуде…", "Загрузка…")}</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">{T("Өтінімдер жоқ", "Заявок нет")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">{T("Күні / уақыты", "Дата / время")}</th>
                <th className="text-left px-4 py-3">{T("Зал", "Зал")}</th>
                <th className="text-left px-4 py-3">{T("Ұйымдастырушы", "Организатор")}</th>
                <th className="text-left px-4 py-3">{T("Телефон", "Телефон")}</th>
                <th className="text-left px-4 py-3">{T("Мақсаты", "Цель")}</th>
                <th className="text-left px-4 py-3">{T("Қонақ", "Гостей")}</th>
                <th className="text-left px-4 py-3">{T("Күй", "Статус")}</th>
                <th className="text-right px-4 py-3">{T("Әрекет", "Действия")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {b.date}
                    <div className="text-gray-500">{b.start_time?.slice(0, 5)}–{b.end_time?.slice(0, 5)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{T(HALL_LABEL[b.hall].kk, HALL_LABEL[b.hall].ru)}</td>
                  <td className="px-4 py-3">{b.organizer}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a href={`tel:${b.phone}`} className="text-[color:var(--color-primary)] hover:underline">{b.phone}</a>
                  </td>
                  <td className="px-4 py-3 max-w-[260px]">
                    {b.purpose}
                    {b.notes_admin && <div className="mt-1 text-xs text-gray-500 italic">📝 {b.notes_admin}</div>}
                  </td>
                  <td className="px-4 py-3">{b.attendees}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[b.status]}`}>
                      {T(STATUS_LABEL[b.status].kk, STATUS_LABEL[b.status].ru)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 justify-end flex-wrap">
                      {b.status !== "approved" && (
                        <button onClick={() => patch(b.id, { status: "approved" })} className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs hover:bg-emerald-700">
                          {T("Бекіту", "Одобрить")}
                        </button>
                      )}
                      {b.status !== "rejected" && (
                        <button onClick={() => patch(b.id, { status: "rejected" })} className="px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs hover:bg-red-200">
                          {T("Бас тарту", "Отклонить")}
                        </button>
                      )}
                      <button onClick={() => comment(b)} className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs hover:bg-gray-200">
                        {T("Түсініктеме", "Комментарий")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
