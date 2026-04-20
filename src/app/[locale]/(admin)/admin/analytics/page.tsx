"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

interface KPI {
  sessions_today: number;
  sessions_week: number;
  sessions_month: number;
  pageviews_total: number;
  pageviews_today: number;
  pageviews_week: number;
  pageviews_month: number;
  events_today: number;
}

interface TopPath {
  path: string;
  views: number;
  unique_sessions: number;
}

interface Source {
  source: string;
  sessions: number;
}

interface RecentEvent {
  id: string;
  type: string;
  path: string | null;
  created_at: string;
}

interface Summary {
  kpi: KPI;
  top_paths: TopPath[];
  sources: Source[];
  recent_events: RecentEvent[];
}

export default function AdminAnalyticsPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";

  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    setUnauthorized(false);
    try {
      const r = await fetch("/api/admin/analytics/summary");
      const body = await r.json();
      if (r.status === 401 || r.status === 403) {
        setUnauthorized(true);
        return;
      }
      if (!r.ok) {
        setErr(body.error || (locale === "kk" ? "Жүктеу қатесі" : "Ошибка загрузки"));
        return;
      }
      setData(body.data as Summary);
    } catch {
      setErr(locale === "kk" ? "Жүктеу қатесі" : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    load();
  }, [load]);

  if (unauthorized) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        {locale === "kk" ? "Рұқсат жоқ" : "Unauthorized"}
      </div>
    );
  }

  const fmtDt = (s: string) => {
    try {
      return new Date(s).toLocaleString(locale === "kk" ? "kk-KZ" : "ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return s;
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "kk" ? "Аналитика" : "Аналитика"}
        </h1>
        <button
          onClick={load}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
        >
          {locale === "kk" ? "Жаңарту" : "Обновить"}
        </button>
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      {loading || !data ? (
        <div className="text-gray-400">…</div>
      ) : (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title={locale === "kk" ? "Сессиялар бүгін" : "Сессии сегодня"}
              value={data.kpi.sessions_today}
            />
            <KpiCard
              title={locale === "kk" ? "Сессиялар 7 күн" : "Сессии за 7 дней"}
              value={data.kpi.sessions_week}
            />
            <KpiCard
              title={locale === "kk" ? "Сессиялар 30 күн" : "Сессии за 30 дней"}
              value={data.kpi.sessions_month}
            />
            <KpiCard
              title={locale === "kk" ? "Барлық көрулер" : "Всего просмотров"}
              value={data.kpi.pageviews_total}
              subtitle={
                (locale === "kk" ? "Бүгін: " : "Сегодня: ") + data.kpi.pageviews_today
              }
            />
          </div>

          {/* Top paths */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {locale === "kk" ? "Топ беттер (7 күн)" : "Топ страниц (7 дней)"}
              </h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <Th>{locale === "kk" ? "Жол" : "Путь"}</Th>
                  <Th>{locale === "kk" ? "Көрулер" : "Просмотры"}</Th>
                  <Th>{locale === "kk" ? "Бірегей сессиялар" : "Уникальные сессии"}</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.top_paths.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-400">—</td>
                  </tr>
                ) : (
                  data.top_paths.map((p) => (
                    <tr key={p.path}>
                      <td className="px-4 py-2 max-w-[400px] truncate font-mono text-xs text-gray-700">
                        {p.path}
                      </td>
                      <td className="px-4 py-2 font-semibold text-gray-900">{p.views}</td>
                      <td className="px-4 py-2 text-gray-700">{p.unique_sessions}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Sources */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {locale === "kk" ? "Көздер (7 күн)" : "Источники (7 дней)"}
              </h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <Th>{locale === "kk" ? "Көз" : "Источник"}</Th>
                  <Th>{locale === "kk" ? "Сессиялар" : "Сессии"}</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.sources.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-6 text-center text-gray-400">—</td>
                  </tr>
                ) : (
                  data.sources.map((s) => (
                    <tr key={s.source}>
                      <td className="px-4 py-2 max-w-[400px] truncate text-gray-700">
                        {s.source}
                      </td>
                      <td className="px-4 py-2 font-semibold text-gray-900">{s.sessions}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Recent events */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {locale === "kk" ? "Соңғы оқиғалар" : "Последние события"}
              </h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <Th>{locale === "kk" ? "Түрі" : "Тип"}</Th>
                  <Th>{locale === "kk" ? "Жол" : "Путь"}</Th>
                  <Th>{locale === "kk" ? "Уақыт" : "Время"}</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recent_events.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-400">—</td>
                  </tr>
                ) : (
                  data.recent_events.map((e) => (
                    <tr key={e.id}>
                      <td className="px-4 py-2 font-mono text-xs text-gray-700">{e.type}</td>
                      <td className="px-4 py-2 max-w-[400px] truncate font-mono text-xs text-gray-600">
                        {e.path || "—"}
                      </td>
                      <td className="px-4 py-2 text-gray-600">{fmtDt(e.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className="mt-2 text-3xl font-bold text-gray-900">{value.toLocaleString()}</div>
      {subtitle && <div className="mt-1 text-xs text-gray-500">{subtitle}</div>}
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
