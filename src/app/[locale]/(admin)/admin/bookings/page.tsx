"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { useConfirm } from "@/components/admin/ConfirmProvider";

type Status = "pending" | "approved" | "rejected" | "cancelled" | "completed";

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

const STATUSES: Status[] = ["pending", "approved", "rejected", "cancelled", "completed"];
const STATUS_LABEL: Record<Status, { kk: string; ru: string }> = {
  pending: { kk: "Күтуде", ru: "Ожидает" },
  approved: { kk: "Бекітілді", ru: "Одобрено" },
  rejected: { kk: "Қабылданбады", ru: "Отклонено" },
  cancelled: { kk: "Бас тартылды", ru: "Отменено" },
  completed: { kk: "Аяқталды", ru: "Завершено" },
};
const STATUS_COLOR: Record<Status, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-200 text-gray-600",
  completed: "bg-gray-200 text-gray-700",
};
const HALL_LABEL: Record<Booking["hall"], { kk: string; ru: string }> = {
  big: { kk: "Үлкен зал", ru: "Большой зал" },
  chamber: { kk: "Камералық зал", ru: "Камерный зал" },
  rehearsal: { kk: "Жаттығу залы", ru: "Репетиционный зал" },
};

export default function AdminBookingsPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  const confirm = useConfirm();
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const [filter, setFilter] = useState<"" | Status>("pending");
  const [items, setItems] = useState<Booking[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const [listR, pendR] = await Promise.all([
        fetch(`/api/admin/bookings${filter ? `?status=${filter}` : ""}`),
        fetch(`/api/admin/bookings?status=pending`),
      ]);
      const list = await listR.json();
      const pend = await pendR.json();
      if (!listR.ok) throw new Error(list.error || "error");
      setItems(list.data?.bookings ?? []);
      setPendingCount((pend.data?.bookings ?? []).length);
    } catch {
      setErr(T("Жүктеу қатесі", "Ошибка загрузки"));
    } finally {
      setLoading(false);
    }
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id: string, body: { status?: Status; notes_admin?: string }) => {
    const r = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) load();
  };

  const cancel = async (b: Booking) => {
    const ok = await confirm({
      message: T(
        "Бекітілген броньды бас тарту керек пе? Слот босайды.",
        "Отменить уже одобренное бронирование? Слот освободится."
      ),
    });
    if (ok) patch(b.id, { status: "cancelled" });
  };

  const comment = (b: Booking) => {
    const note = window.prompt(T("Әкімші түсініктемесі", "Комментарий администратора"), b.notes_admin ?? "");
    if (note !== null) patch(b.id, { notes_admin: note });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{T("Зал брондау", "Управление бронированиями")}</h1>
          {pendingCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-sm font-medium">
              {pendingCount} {T("күтуде", "ожидают")}
            </span>
          )}
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
          <button onClick={() => setFilter("")} className={`px-3 py-1.5 rounded-md text-sm ${filter === "" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}>
            {T("Барлығы", "Все")}
          </button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-md text-sm ${filter === s ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}>
              {T(STATUS_LABEL[s].kk, STATUS_LABEL[s].ru)}
            </button>
          ))}
        </div>
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{err}</div>}
      {loading ? (
        <p className="text-gray-500">{T("Жүктелуде…", "Загрузка…")}</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
          {T("Өтінімдер жоқ", "Бронирований нет")}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((b) => (
            <div key={b.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{T(HALL_LABEL[b.hall].kk, HALL_LABEL[b.hall].ru)}</h3>
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[b.status]}`}>
                      {T(STATUS_LABEL[b.status].kk, STATUS_LABEL[b.status].ru)}
                    </span>
                    <span className="text-xs text-gray-400">{b.source === "chatbot" ? "AI" : b.source}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                    <span>🗓 {b.date} · {b.start_time?.slice(0, 5)}–{b.end_time?.slice(0, 5)}</span>
                    <span>👤 {b.organizer}</span>
                    <span>📞 <a href={`tel:${b.phone}`} className="hover:underline">{b.phone}</a></span>
                    <span>👥 {b.attendees}</span>
                  </div>
                  {b.purpose && <p className="text-sm text-gray-500">{T("Мақсаты", "Цель")}: {b.purpose}</p>}
                  {b.notes_admin && <p className="text-xs text-gray-400 italic">📝 {b.notes_admin}</p>}
                </div>

                <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                  {b.status === "pending" && (
                    <>
                      <button onClick={() => patch(b.id, { status: "approved" })} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700">
                        ✓ {T("Бекіту", "Одобрить")}
                      </button>
                      <button onClick={() => patch(b.id, { status: "rejected" })} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm hover:bg-red-200">
                        ✕ {T("Бас тарту", "Отклонить")}
                      </button>
                    </>
                  )}
                  {b.status === "approved" && (
                    <button onClick={() => cancel(b)} className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">
                      ✕ {T("Болдырмау", "Отменить")}
                    </button>
                  )}
                  <button onClick={() => comment(b)} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200">
                    {T("Түсініктеме", "Комментарий")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
