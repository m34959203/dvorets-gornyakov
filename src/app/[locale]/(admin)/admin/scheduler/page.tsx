"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

type JobStatus = "pending" | "running" | "done" | "failed" | "";
type JobType = "publish_news" | "publish_event" | "";

interface Job {
  id: string;
  type: string;
  status: string;
  payload: Record<string, unknown>;
  run_at: string;
  started_at: string | null;
  completed_at: string | null;
  attempts: number;
  last_error: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  done: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

export default function SchedulerPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JobStatus>("");
  const [typeFilter, setTypeFilter] = useState<JobType>("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<{
    type: "publish_news" | "publish_event";
    target_id: string;
    run_at: string;
  }>({ type: "publish_news", target_id: "", run_at: "" });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    setUnauthorized(false);
    try {
      const qs = new URLSearchParams();
      if (statusFilter) qs.set("status", statusFilter);
      if (typeFilter) qs.set("type", typeFilter);
      const r = await fetch(`/api/admin/scheduler?${qs.toString()}`);
      if (r.status === 401) {
        setUnauthorized(true);
        return;
      }
      const body = await r.json();
      if (!r.ok) {
        setErr(body.error || "error");
        return;
      }
      setItems(body.data.items);
    } catch {
      setErr(T("Желі қатесі", "Сетевая ошибка"));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErr("");
    try {
      const r = await fetch("/api/admin/scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          target_id: form.target_id,
          run_at: new Date(form.run_at).toISOString(),
        }),
      });
      const body = await r.json();
      if (!r.ok) {
        setFormErr(body.error || "error");
        return;
      }
      setDrawerOpen(false);
      setForm({ type: "publish_news", target_id: "", run_at: "" });
      await load();
    } catch {
      setFormErr(T("Желі қатесі", "Сетевая ошибка"));
    } finally {
      setSaving(false);
    }
  };

  const onCancel = async (id: string) => {
    if (!confirm(T("Жою керек пе?", "Удалить задачу?"))) return;
    const r = await fetch(`/api/admin/scheduler/${id}`, { method: "DELETE" });
    if (r.ok) await load();
  };

  const onRequeue = async (id: string) => {
    const r = await fetch(`/api/admin/scheduler/${id}`, { method: "POST" });
    if (r.ok) await load();
  };

  if (unauthorized) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {T("Рұқсат жоқ", "Нет доступа")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {T("Жоспарлағыш", "Планировщик публикаций")}
        </h1>
        <button
          onClick={() => setDrawerOpen(true)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {T("+ Жоспарлау", "+ Запланировать")}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JobStatus)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">{T("Барлық мәртебе", "Все статусы")}</option>
          <option value="pending">{T("Күтуде", "В очереди")}</option>
          <option value="running">{T("Орындалуда", "Выполняется")}</option>
          <option value="done">{T("Аяқталды", "Готово")}</option>
          <option value="failed">{T("Қате", "Ошибка")}</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as JobType)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">{T("Барлық түр", "Все типы")}</option>
          <option value="publish_news">{T("Жаңалықты жариялау", "Публикация новости")}</option>
          <option value="publish_event">{T("Іс-шараны жариялау", "Публикация события")}</option>
        </select>
      </div>

      {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="overflow-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
            <tr>
              <th className="px-3 py-2">{T("Түр", "Тип")}</th>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">{T("Мәртебе", "Статус")}</th>
              <th className="px-3 py-2">{T("Орындау", "Запуск")}</th>
              <th className="px-3 py-2">{T("Әрекет", "Попытки")}</th>
              <th className="px-3 py-2">{T("Қате", "Ошибка")}</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                  …
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                  {T("Бос", "Пусто")}
                </td>
              </tr>
            ) : (
              items.map((j) => (
                <tr key={j.id} className="border-t border-gray-100 align-top">
                  <td className="px-3 py-2 font-medium">
                    {j.type === "publish_news"
                      ? T("Жаңалық", "Новость")
                      : T("Іс-шара", "Событие")}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-600">
                    {String(j.payload.news_id || j.payload.event_id || "").slice(0, 8)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[j.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {j.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">
                    {new Date(j.run_at).toLocaleString("ru-RU")}
                  </td>
                  <td className="px-3 py-2 text-xs">{j.attempts}</td>
                  <td className="px-3 py-2 text-xs text-red-600 max-w-xs truncate">
                    {j.last_error}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {(j.status === "failed" || j.status === "done") && (
                      <button
                        onClick={() => onRequeue(j.id)}
                        className="mr-2 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
                      >
                        {T("Қайта", "Повторить")}
                      </button>
                    )}
                    {(j.status === "pending" || j.status === "failed") && (
                      <button
                        onClick={() => onCancel(j.id)}
                        className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                      >
                        {T("Жою", "Удалить")}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/30"
          onClick={() => setDrawerOpen(false)}
        >
          <form
            onSubmit={onCreate}
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-md space-y-4 overflow-auto bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold">
              {T("Жаңа тапсырма", "Новая задача")}
            </h2>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                {T("Түр", "Тип")}
              </span>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as "publish_news" | "publish_event" })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="publish_news">{T("Жаңалықты жариялау", "Публикация новости")}</option>
                <option value="publish_event">
                  {T("Іс-шараны жариялау", "Публикация события")}
                </option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                {T("Нысан ID (UUID)", "ID объекта (UUID)")}
              </span>
              <input
                required
                value={form.target_id}
                onChange={(e) => setForm({ ...form, target_id: e.target.value })}
                placeholder="00000000-0000-0000-0000-000000000000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                {T("Жіберу уақыты", "Время публикации")}
              </span>
              <input
                required
                type="datetime-local"
                value={form.run_at}
                onChange={(e) => setForm({ ...form, run_at: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>

            {formErr && <div className="text-sm text-red-600">{formErr}</div>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                {T("Бас тарту", "Отмена")}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "…" : T("Сақтау", "Сохранить")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
