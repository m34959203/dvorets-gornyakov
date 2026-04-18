"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

type EnrollmentStatus = "pending" | "approved" | "rejected";

interface Enrollment {
  id: string;
  club_id: string;
  child_name: string;
  child_age: number;
  parent_name: string;
  phone: string;
  email: string | null;
  status: EnrollmentStatus;
  created_at: string;
  club_name_ru: string;
  club_name_kk: string;
}

const STATUSES: EnrollmentStatus[] = ["pending", "approved", "rejected"];

const STATUS_LABELS: Record<EnrollmentStatus, { kk: string; ru: string }> = {
  pending: { kk: "Күтуде", ru: "В ожидании" },
  approved: { kk: "Мақұлданды", ru: "Одобрено" },
  rejected: { kk: "Қабылданбады", ru: "Отклонено" },
};

const STATUS_COLORS: Record<EnrollmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const ACTION_LABELS: Record<EnrollmentStatus, { kk: string; ru: string }> = {
  approved: { kk: "Мақұлдау", ru: "Одобрить" },
  rejected: { kk: "Қабылдамау", ru: "Отклонить" },
  pending: { kk: "Күтуге", ru: "В ожидание" },
};

export default function AdminEnrollmentsPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";

  const [status, setStatus] = useState<"" | EnrollmentStatus>("");
  const [items, setItems] = useState<Enrollment[]>([]);
  const [selected, setSelected] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [unauthorized, setUnauthorized] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const url = `/api/admin/enrollments${status ? `?status=${status}` : ""}`;
      const r = await fetch(url);
      const body = await r.json();
      if (r.status === 401 || r.status === 403) {
        setUnauthorized(true);
        setItems([]);
        return;
      }
      if (!r.ok) {
        setErr(body.error || "Ошибка загрузки");
        return;
      }
      setUnauthorized(false);
      setItems(body.data?.items ?? []);
    } catch {
      setErr("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (next: EnrollmentStatus) => {
    if (!selected) return;
    const r = await fetch(`/api/admin/enrollments/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      alert(body.error || "Ошибка");
      return;
    }
    setSelected(null);
    load();
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm(locale === "kk" ? "Жоюды растайсыз ба?" : "Подтвердите удаление")) return;
    const r = await fetch(`/api/admin/enrollments/${selected.id}`, { method: "DELETE" });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      alert(body.error || "Ошибка");
      return;
    }
    setSelected(null);
    load();
  };

  const dateLoc = locale === "kk" ? "kk-KZ" : "ru-RU";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {locale === "kk" ? "Тіркелу өтінімдері" : "Заявки на запись"}
      </h1>

      {unauthorized && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Unauthorized</div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setStatus("")}
          className={
            "rounded-full px-4 py-1.5 text-sm font-medium " +
            (status === "" ? "bg-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200")
          }
        >
          {locale === "kk" ? "Барлығы" : "Все"}
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={
              "rounded-full px-4 py-1.5 text-sm font-medium " +
              (status === s ? "bg-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200")
            }
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
              <Th>{locale === "kk" ? "Күйі" : "Статус"}</Th>
              <Th>{locale === "kk" ? "Бала" : "Ребёнок"}</Th>
              <Th>{locale === "kk" ? "Жасы" : "Возраст"}</Th>
              <Th>{locale === "kk" ? "Ата-ана" : "Родитель"}</Th>
              <Th>{locale === "kk" ? "Телефон" : "Телефон"}</Th>
              <Th>{locale === "kk" ? "Үйірме" : "Кружок"}</Th>
              <Th>{locale === "kk" ? "Келді" : "Создано"}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  …
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  —
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr
                  key={it.id}
                  onClick={() => setSelected(it)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium " +
                        STATUS_COLORS[it.status]
                      }
                    >
                      {STATUS_LABELS[it.status][locale]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{it.child_name}</td>
                  <td className="px-4 py-3 text-gray-700">{it.child_age}</td>
                  <td className="px-4 py-3 text-gray-700">{it.parent_name}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{it.phone}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {locale === "kk" ? it.club_name_kk : it.club_name_ru}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(it.created_at).toLocaleDateString(dateLoc)}
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
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <span
                className={
                  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium " +
                  STATUS_COLORS[selected.status]
                }
              >
                {STATUS_LABELS[selected.status][locale]}
              </span>
            </div>

            <Row
              k={locale === "kk" ? "Үйірме" : "Кружок"}
              v={locale === "kk" ? selected.club_name_kk : selected.club_name_ru}
            />
            <Row k={locale === "kk" ? "Бала" : "Ребёнок"} v={selected.child_name} />
            <Row k={locale === "kk" ? "Жасы" : "Возраст"} v={selected.child_age} />
            <Row k={locale === "kk" ? "Ата-ана" : "Родитель"} v={selected.parent_name} />
            <Row
              k="Телефон"
              v={
                <a
                  href={`tel:${selected.phone.replace(/\s/g, "")}`}
                  className="text-primary hover:underline"
                >
                  {selected.phone}
                </a>
              }
            />
            {selected.email && (
              <Row
                k="Email"
                v={
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                    {selected.email}
                  </a>
                }
              />
            )}
            <Row
              k={locale === "kk" ? "Келді" : "Создано"}
              v={new Date(selected.created_at).toLocaleDateString(dateLoc)}
            />

            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(["approved", "rejected", "pending"] as EnrollmentStatus[]).map((s) => (
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
                  {ACTION_LABELS[s][locale]}
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                {locale === "kk" ? "Жою" : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
      {children}
    </th>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-gray-100 py-2 text-sm">
      <div className="w-32 shrink-0 text-gray-500">{k}</div>
      <div className="min-w-0 flex-1 text-gray-900">{v}</div>
    </div>
  );
}
