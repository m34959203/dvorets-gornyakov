"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Cfg = {
  platform: string;
  enabled: boolean;
  default_language: "kk" | "ru";
  bot_token?: string | null;
  chat_id?: string | null;
  access_token?: string | null;
  page_id?: string | null;
  facebook_access_token?: string | null;
  facebook_page_id?: string | null;
};

const PLATFORMS: { id: string; label: string; hint: { kk: string; ru: string }; fields: { key: keyof Cfg; label: string }[] }[] = [
  {
    id: "telegram",
    label: "Telegram",
    hint: { kk: "Бот токені (@BotFather) + канал ID немесе @username", ru: "Токен бота (@BotFather) + ID канала или @username" },
    fields: [
      { key: "bot_token", label: "Bot Token" },
      { key: "chat_id", label: "Chat ID / @channel" },
    ],
  },
  {
    id: "instagram",
    label: "Instagram",
    hint: { kk: "Graph API токені + IG User ID (бизнес-аккаунт)", ru: "Токен Graph API + IG User ID (бизнес-аккаунт)" },
    fields: [
      { key: "access_token", label: "Access Token" },
      { key: "page_id", label: "IG User ID" },
    ],
  },
  {
    id: "facebook",
    label: "Facebook",
    hint: { kk: "Page Access Token (long-lived) + Page ID", ru: "Page Access Token (long-lived) + Page ID" },
    fields: [
      { key: "facebook_access_token", label: "Page Access Token" },
      { key: "facebook_page_id", label: "Page ID" },
    ],
  },
];

export default function SocialMediaSettings({ locale }: { locale: Locale }) {
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);
  const [configs, setConfigs] = useState<Record<string, Cfg>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/social-media", { cache: "no-store" });
        const j = await r.json();
        const map: Record<string, Cfg> = {};
        for (const c of (j.data?.configs ?? []) as Cfg[]) map[c.platform] = c;
        for (const p of PLATFORMS) {
          if (!map[p.id]) map[p.id] = { platform: p.id, enabled: false, default_language: "kk" };
        }
        setConfigs(map);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const patch = (platform: string, key: keyof Cfg, value: unknown) =>
    setConfigs((c) => ({ ...c, [platform]: { ...c[platform], [key]: value } }));

  const save = async (platform: string) => {
    setSaving(platform);
    try {
      await fetch("/api/admin/social-media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configs[platform]),
      });
      setSavedAt(platform);
      setTimeout(() => setSavedAt((s) => (s === platform ? null : s)), 2000);
    } finally {
      setSaving(null);
    }
  };

  if (!loaded) return <p className="text-sm text-gray-400">{T("Жүктелуде…", "Загрузка…")}</p>;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {PLATFORMS.map((p) => {
        const c = configs[p.id];
        if (!c) return null;
        return (
          <div key={p.id} className="flex flex-col rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{p.label}</h3>
              <button
                type="button"
                role="switch"
                aria-checked={c.enabled}
                onClick={() => patch(p.id, "enabled", !c.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${c.enabled ? "bg-primary" : "bg-gray-300"}`}
                aria-label={`${p.label} enabled`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${c.enabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            <p className="mb-4 text-xs text-gray-400">{T(p.hint.kk, p.hint.ru)}</p>

            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              {T("Әдепкі тіл", "Язык по умолчанию")}
            </label>
            <select
              value={c.default_language}
              onChange={(e) => patch(p.id, "default_language", e.target.value)}
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="kk">Қазақша</option>
              <option value="ru">Русский</option>
            </select>

            {p.fields.map((f) => (
              <div key={String(f.key)} className="mb-3">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">{f.label}</label>
                <input
                  type="text"
                  value={(c[f.key] as string) ?? ""}
                  onChange={(e) => patch(p.id, f.key, e.target.value)}
                  placeholder="—"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            ))}

            <button
              onClick={() => save(p.id)}
              disabled={saving === p.id}
              className="mt-auto rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {saving === p.id ? T("Сақталуда…", "Сохранение…") : savedAt === p.id ? T("✓ Сақталды", "✓ Сохранено") : T("Сақтау", "Сохранить")}
            </button>
          </div>
        );
      })}
    </div>
  );
}
