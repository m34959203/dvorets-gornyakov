"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface SettingItem {
  key: string;
  value: string;
}

const GROUPS: { title: { kk: string; ru: string }; keys: string[] }[] = [
  {
    title: { kk: "Сайт", ru: "Сайт" },
    keys: ["site_name_kk", "site_name_ru", "phone", "email", "working_hours"],
  },
  {
    title: { kk: "Мекенжай", ru: "Адрес" },
    keys: ["address_kk", "address_ru"],
  },
  {
    title: { kk: "Әлеуметтік желілер", ru: "Соцсети" },
    keys: ["telegram_channel", "instagram_handle"],
  },
  {
    title: { kk: "Аналитика", ru: "Аналитика" },
    keys: ["ga4_measurement_id", "yandex_metrika_id"],
  },
];

const KNOWN_KEYS = GROUPS.flatMap((g) => g.keys);

function labelFor(key: string): string {
  const map: Record<string, string> = {
    site_name_kk: "Название сайта (KZ)",
    site_name_ru: "Название сайта (RU)",
    phone: "Телефон",
    email: "Email",
    working_hours: "Часы работы",
    address_kk: "Адрес (KZ)",
    address_ru: "Адрес (RU)",
    telegram_channel: "Telegram",
    instagram_handle: "Instagram",
    ga4_measurement_id: "Google Analytics ID (G-XXXXXXX)",
    yandex_metrika_id: "Яндекс.Метрика ID",
  };
  return map[key] || key;
}

export default function AdminSettingsPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";

  const [values, setValues] = useState<Record<string, string>>({});
  const [extras, setExtras] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/admin/settings");
      const body = await r.json();
      if (!r.ok) {
        setErr(body.error || (locale === "kk" ? "Жүктеу қатесі" : "Ошибка загрузки"));
        return;
      }
      const items: SettingItem[] = body.data?.items ?? [];
      const v: Record<string, string> = {};
      for (const k of KNOWN_KEYS) v[k] = "";
      const extra: SettingItem[] = [];
      for (const it of items) {
        if (KNOWN_KEYS.includes(it.key)) {
          v[it.key] = it.value ?? "";
        } else {
          extra.push({ key: it.key, value: it.value ?? "" });
        }
      }
      setValues(v);
      setExtras(extra);
    } catch {
      setErr(locale === "kk" ? "Жүктеу қатесі" : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    load();
  }, [load]);

  const updateKnown = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const updateExtra = (idx: number, field: "key" | "value", value: string) => {
    setExtras((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const addExtra = () => {
    setExtras((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeExtra = (idx: number) => {
    setExtras((prev) => prev.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setSaving(true);
    setErr("");
    try {
      const items: SettingItem[] = [];
      for (const k of KNOWN_KEYS) {
        items.push({ key: k, value: values[k] ?? "" });
      }
      for (const e of extras) {
        if (e.key.trim()) items.push({ key: e.key.trim(), value: e.value });
      }
      const r = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const body = await r.json();
      if (!r.ok) {
        setErr(body.error || (locale === "kk" ? "Сақтау қатесі" : "Ошибка сохранения"));
        return;
      }
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 3000);
    } catch {
      setErr(locale === "kk" ? "Сақтау қатесі" : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {locale === "kk" ? "Баптаулар" : "Настройки"}
      </h1>

      {err && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>
      )}
      {savedAt && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {locale === "kk" ? "Сақталды" : "Сохранено"}
        </div>
      )}

      {loading ? (
        <div className="text-gray-400">…</div>
      ) : (
        <div className="max-w-3xl space-y-6">
          {GROUPS.map((group) => (
            <div
              key={group.title.ru}
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {group.title[locale]}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {group.keys.map((k) => (
                  <Input
                    key={k}
                    id={`s_${k}`}
                    label={labelFor(k)}
                    value={values[k] ?? ""}
                    onChange={(e) => updateKnown(k, e.target.value)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {locale === "kk" ? "Қосымша кілттер" : "Дополнительные ключи"}
              </h2>
              <button
                type="button"
                onClick={addExtra}
                className="text-sm font-medium text-primary hover:underline"
              >
                {locale === "kk" ? "+ кілт қосу" : "+ добавить ключ"}
              </button>
            </div>

            {extras.length === 0 ? (
              <p className="text-sm text-gray-400">—</p>
            ) : (
              <div className="space-y-3">
                {extras.map((it, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <div className="flex-1">
                      <Input
                        id={`ex_key_${i}`}
                        label={locale === "kk" ? "Кілт" : "Ключ"}
                        value={it.key}
                        onChange={(e) => updateExtra(i, "key", e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        id={`ex_val_${i}`}
                        label={locale === "kk" ? "Мән" : "Значение"}
                        value={it.value}
                        onChange={(e) => updateExtra(i, "value", e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExtra(i)}
                      className="mb-1 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={save} loading={saving}>
              {locale === "kk" ? "Сақтау" : "Сохранить"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
