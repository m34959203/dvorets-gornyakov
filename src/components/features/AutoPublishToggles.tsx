"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const PLATFORMS = [
  { id: "telegram", label: "Telegram" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
] as const;

const KINDS = [
  { id: "news", kk: "Жаңалықтар", ru: "Новости" },
  { id: "events", kk: "Іс-шаралар", ru: "События" },
] as const;

const flagKey = (platform: string, kind: string) => `auto_${platform}_${kind}`;

export default function AutoPublishToggles({ locale }: { locale: Locale }) {
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/settings", { cache: "no-store" });
        const j = await r.json();
        const items: { key: string; value: string }[] = j.data?.items ?? [];
        const map: Record<string, boolean> = {};
        for (const it of items) {
          if (it.key.startsWith("auto_")) map[it.key] = it.value === "true";
        }
        setFlags(map);
      } catch {
        /* ignore */
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const toggle = async (key: string) => {
    const next = !flags[key];
    setFlags((f) => ({ ...f, [key]: next }));
    setSavingKey(key);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ key, value: next ? "true" : "false" }] }),
      });
    } catch {
      setFlags((f) => ({ ...f, [key]: !next })); // откат при ошибке
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {T("Автопубликация", "Автопубликация")}
      </h2>
      <p className="mb-4 text-xs text-gray-400">
        {T(
          "Қай платформаларға жаңалықтар мен іс-шаралар автоматты жарияланады.",
          "На какие платформы автоматически публиковать новости и события."
        )}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="py-2 pr-4 font-medium">{T("Платформа", "Платформа")}</th>
              {KINDS.map((k) => (
                <th key={k.id} className="px-3 py-2 font-medium">{T(k.kk, k.ru)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLATFORMS.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="py-3 pr-4 font-medium text-gray-900">{p.label}</td>
                {KINDS.map((k) => {
                  const key = flagKey(p.id, k.id);
                  const on = flags[key] ?? false;
                  return (
                    <td key={k.id} className="px-3 py-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        disabled={!loaded || savingKey === key}
                        onClick={() => toggle(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                          on ? "bg-primary" : "bg-gray-300"
                        }`}
                        aria-label={`${p.label} · ${T(k.kk, k.ru)}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            on ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        {T(
          "Instagram/Facebook үшін токендер env-те қажет (INSTAGRAM_*, FACEBOOK_*). Telegram — TELEGRAM_BOT_TOKEN + канал.",
          "Для Instagram/Facebook нужны токены в env (INSTAGRAM_*, FACEBOOK_*). Для Telegram — TELEGRAM_BOT_TOKEN + канал."
        )}
      </p>
    </div>
  );
}
