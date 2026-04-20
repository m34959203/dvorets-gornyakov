"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

type PurposeFilter = "" | "chatbot" | "translate" | "recommend" | "other";
type StatusFilter = "" | "success" | "error";

interface Item {
  id: string;
  provider: string;
  model: string;
  purpose: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  cost_usd: number;
  duration_ms: number | null;
  success: boolean;
  error: string | null;
  created_at: string;
}

interface Summary {
  total_requests: number;
  total_cost_usd: number;
  success_rate: number;
  avg_duration_ms: number;
  by_purpose: { purpose: string; count: number; cost: number }[];
  by_day: { date: string; count: number; cost: number }[];
}

interface Payload {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  summary: Summary;
}

const PAGE_SIZE = 50;

export default function AdminAIUsagePage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string)
    ? (params.locale as Locale)
    : "kk";

  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [purpose, setPurpose] = useState<PurposeFilter>("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);

  // Settings: budget + daily limit
  const [budget, setBudget] = useState<string>("");
  const [dailyLimit, setDailyLimit] = useState<string>("");
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<string>("");

  // ---------- loaders ----------
  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    setUnauthorized(false);
    try {
      const qs = new URLSearchParams();
      if (purpose) qs.set("purpose", purpose);
      if (status) qs.set("status", status);
      qs.set("page", String(page));
      qs.set("limit", String(PAGE_SIZE));
      const r = await fetch(`/api/admin/ai-usage?${qs.toString()}`);
      const body = await r.json();
      if (r.status === 401 || r.status === 403) {
        setUnauthorized(true);
        return;
      }
      if (!r.ok) {
        setErr(body.error || "Ошибка загрузки");
        return;
      }
      setData(body.data as Payload);
    } catch {
      setErr("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [purpose, status, page]);

  const loadSettings = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/settings");
      if (!r.ok) return;
      const body = await r.json();
      const items: { key: string; value: string }[] = body.data?.items ?? [];
      const bMap = new Map(items.map((i) => [i.key, i.value]));
      setBudget(bMap.get("ai_monthly_budget_usd") ?? "");
      setDailyLimit(bMap.get("ai_daily_request_limit") ?? "");
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ---------- derived ----------
  const summary = data?.summary;

  const todayCount = useMemo(() => {
    if (!summary) return 0;
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    const row = summary.by_day.find((d) => d.date === iso);
    return row?.count ?? 0;
  }, [summary]);

  const monthCount = useMemo(() => {
    if (!summary) return 0;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `${year}-${month}`;
    return summary.by_day
      .filter((d) => d.date.startsWith(prefix))
      .reduce((sum, d) => sum + d.count, 0);
  }, [summary]);

  const monthCost = useMemo(() => {
    if (!summary) return 0;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `${year}-${month}`;
    return summary.by_day
      .filter((d) => d.date.startsWith(prefix))
      .reduce((sum, d) => sum + d.cost, 0);
  }, [summary]);

  const budgetNum = Number(budget) || 0;
  const budgetPct =
    budgetNum > 0 ? Math.min(100, (monthCost / budgetNum) * 100) : 0;

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  // ---------- handlers ----------
  const onSaveSettings = async () => {
    setSettingsSaving(true);
    setSettingsMsg("");
    try {
      const items = [
        { key: "ai_monthly_budget_usd", value: String(Number(budget) || 0) },
        { key: "ai_daily_request_limit", value: String(Number(dailyLimit) || 0) },
      ];
      const r = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const body = await r.json();
      if (!r.ok) {
        setSettingsMsg(body.error || "Ошибка");
        return;
      }
      setSettingsMsg(locale === "kk" ? "Сақталды" : "Сохранено");
      setTimeout(() => setSettingsMsg(""), 2000);
    } catch {
      setSettingsMsg("Ошибка");
    } finally {
      setSettingsSaving(false);
    }
  };

  if (unauthorized) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        {locale === "kk" ? "Рұқсат жоқ" : "Unauthorized"}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "kk" ? "AI қолданысы" : "AI Usage"}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {locale === "kk"
            ? "Gemini шақырулары, шығын және лимиттер"
            : "Вызовы Gemini, стоимость и лимиты"}
        </p>
      </div>

      {err && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>
      )}

      {/* ---- KPI ---- */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi
          label={locale === "kk" ? "Бүгін сұраныс" : "Запросов сегодня"}
          value={todayCount.toLocaleString("ru-RU")}
        />
        <Kpi
          label={locale === "kk" ? "Айда сұраныс" : "Запросов за месяц"}
          value={monthCount.toLocaleString("ru-RU")}
        />
        <Kpi
          label={locale === "kk" ? "Айдағы шығын" : "Cost за месяц"}
          value={`$${monthCost.toFixed(4)}`}
        />
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            {locale === "kk" ? "Бюджеттен %" : "% от бюджета"}
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {budgetNum > 0 ? `${budgetPct.toFixed(1)}%` : "—"}
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={
                "h-2 transition-all " +
                (budgetPct >= 90
                  ? "bg-red-500"
                  : budgetPct >= 70
                  ? "bg-amber-500"
                  : "bg-emerald-500")
              }
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            ${monthCost.toFixed(4)} / ${budgetNum.toFixed(2)}
          </div>
        </div>
      </div>

      {/* ---- Settings ---- */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">
          {locale === "kk" ? "Лимиттер" : "Лимиты"}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-700">
              {locale === "kk" ? "Айлық бюджет $" : "Месячный бюджет $"}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-700">
              {locale === "kk" ? "Күндік сұраныс лимиті" : "Дневной лимит запросов"}
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={onSaveSettings}
            disabled={settingsSaving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {settingsSaving
              ? locale === "kk"
                ? "Сақталуда…"
                : "Сохранение…"
              : locale === "kk"
              ? "Сақтау"
              : "Сохранить"}
          </button>
          {settingsMsg && (
            <span className="text-sm text-gray-600">{settingsMsg}</span>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {locale === "kk"
            ? "Бюджет = 0 болса, шектеу жоқ. Ай сайын автоматты қалпына келтіріледі."
            : "Если бюджет = 0, ограничения нет. Сбрасывается в начале каждого месяца."}
        </p>
      </div>

      {/* ---- By-day chart (table) ---- */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">
          {locale === "kk" ? "30 күнге динамика" : "Динамика за 30 дней"}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2">{locale === "kk" ? "Күн" : "Дата"}</th>
                <th className="py-2 text-right">
                  {locale === "kk" ? "Сұраныстар" : "Запросов"}
                </th>
                <th className="py-2 text-right">
                  {locale === "kk" ? "Шығын" : "Стоимость"}
                </th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-400">
                    …
                  </td>
                </tr>
              ) : !summary || summary.by_day.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-400">
                    —
                  </td>
                </tr>
              ) : (
                summary.by_day.map((d) => {
                  const max = Math.max(...summary.by_day.map((x) => x.count));
                  const pct = max > 0 ? (d.count / max) * 100 : 0;
                  return (
                    <tr key={d.date}>
                      <td className="py-2 text-gray-700">{d.date}</td>
                      <td className="py-2 text-right font-mono text-gray-700">
                        {d.count}
                      </td>
                      <td className="py-2 text-right font-mono text-gray-700">
                        ${d.cost.toFixed(5)}
                      </td>
                      <td className="py-2 pl-3 w-1/2">
                        <div className="h-2 rounded-full bg-gray-100">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Requests table ---- */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="text-sm">
          <span className="mr-2 text-gray-600">
            {locale === "kk" ? "Мақсаты" : "Purpose"}:
          </span>
          <select
            value={purpose}
            onChange={(e) => {
              setPurpose(e.target.value as PurposeFilter);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">{locale === "kk" ? "Барлығы" : "Все"}</option>
            <option value="chatbot">chatbot</option>
            <option value="translate">translate</option>
            <option value="recommend">recommend</option>
            <option value="other">other</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mr-2 text-gray-600">
            {locale === "kk" ? "Күйі" : "Status"}:
          </span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">{locale === "kk" ? "Барлығы" : "Все"}</option>
            <option value="success">{locale === "kk" ? "Сәтті" : "Успех"}</option>
            <option value="error">{locale === "kk" ? "Қате" : "Ошибка"}</option>
          </select>
        </label>
        <div className="ml-auto text-xs text-gray-500">
          {summary
            ? `${locale === "kk" ? "Орташа" : "Avg"}: ${summary.avg_duration_ms}ms · ${locale === "kk" ? "Сәттілік" : "Success"}: ${(summary.success_rate * 100).toFixed(1)}%`
            : ""}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>{locale === "kk" ? "Уақыт" : "Время"}</Th>
              <Th>{locale === "kk" ? "Модель" : "Модель"}</Th>
              <Th>{locale === "kk" ? "Мақсаты" : "Цель"}</Th>
              <Th className="text-right">{locale === "kk" ? "Токен" : "Токены"}</Th>
              <Th className="text-right">$</Th>
              <Th className="text-right">ms</Th>
              <Th>{locale === "kk" ? "Күйі" : "Статус"}</Th>
              <Th>{locale === "kk" ? "Қолданушы" : "Пользователь"}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">…</td>
              </tr>
            ) : !data || data.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">—</td>
              </tr>
            ) : (
              data.items.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {new Date(i.created_at).toLocaleString(
                      locale === "kk" ? "kk-KZ" : "ru-RU",
                      { dateStyle: "short", timeStyle: "short" }
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-600">
                    {i.model}
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {i.purpose}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-gray-700">
                    {i.total_tokens != null
                      ? i.total_tokens.toLocaleString("ru-RU")
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-gray-700">
                    ${Number(i.cost_usd).toFixed(6)}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {i.duration_ms ?? "—"}
                  </td>
                  <td className="px-4 py-2">
                    {i.success ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        OK
                      </span>
                    ) : (
                      <span
                        className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
                        title={i.error ?? ""}
                      >
                        ERR
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {i.user_name || i.user_email || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > data.limit && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            {locale === "kk" ? "Барлығы" : "Всего"}: {data.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              ←
            </button>
            <span className="text-gray-700">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 " +
        (className ?? "")
      }
    >
      {children}
    </th>
  );
}
