"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

type Platform = "telegram" | "instagram";
type Kind = "news" | "event";

interface Template {
  id: string;
  platform: Platform;
  kind: Kind;
  name: string;
  body_kk: string;
  body_ru: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

const PLACEHOLDERS_NEWS = ["title_ru", "title_kk", "excerpt_ru", "excerpt_kk", "url"];
const PLACEHOLDERS_EVENT = ["title_ru", "title_kk", "date_ru", "date_kk", "location", "url"];

export default function SocialTemplatesPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState<{
    platform: Platform;
    kind: Kind;
    name: string;
    body_kk: string;
    body_ru: string;
    is_default: boolean;
    is_active: boolean;
  }>({
    platform: "telegram",
    kind: "news",
    name: "",
    body_kk: "",
    body_ru: "",
    is_default: false,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/admin/social-templates");
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      platform: "telegram",
      kind: "news",
      name: "",
      body_kk: "",
      body_ru: "",
      is_default: false,
      is_active: true,
    });
    setFormErr("");
    setDrawerOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditing(t);
    setForm({
      platform: t.platform,
      kind: t.kind,
      name: t.name,
      body_kk: t.body_kk,
      body_ru: t.body_ru,
      is_default: t.is_default,
      is_active: t.is_active,
    });
    setFormErr("");
    setDrawerOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErr("");
    try {
      const url = editing
        ? `/api/admin/social-templates/${editing.id}`
        : `/api/admin/social-templates`;
      const method = editing ? "PUT" : "POST";
      const payload = editing
        ? {
            name: form.name,
            body_kk: form.body_kk,
            body_ru: form.body_ru,
            is_default: form.is_default,
            is_active: form.is_active,
          }
        : form;
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await r.json();
      if (!r.ok) {
        setFormErr(body.error || "error");
        return;
      }
      setDrawerOpen(false);
      await load();
    } catch {
      setFormErr(T("Желі қатесі", "Сетевая ошибка"));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!editing) return;
    if (!confirm(T("Жою керек пе?", "Удалить шаблон?"))) return;
    const r = await fetch(`/api/admin/social-templates/${editing.id}`, { method: "DELETE" });
    if (r.ok) {
      setDrawerOpen(false);
      await load();
    }
  };

  if (unauthorized) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {T("Рұқсат жоқ", "Нет доступа")}
      </div>
    );
  }

  const placeholders = form.kind === "event" ? PLACEHOLDERS_EVENT : PLACEHOLDERS_NEWS;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {T("SMM шаблондары", "Шаблоны SMM-постов")}
        </h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {T("+ Жаңа", "+ Новый шаблон")}
        </button>
      </div>

      {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="overflow-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
            <tr>
              <th className="px-3 py-2">{T("Платформа", "Платформа")}</th>
              <th className="px-3 py-2">{T("Түр", "Тип")}</th>
              <th className="px-3 py-2">{T("Атауы", "Название")}</th>
              <th className="px-3 py-2">{T("Мәртебе", "Статус")}</th>
              <th className="px-3 py-2">{T("Үнсіз келісім", "По умолчанию")}</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  …
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  {T("Бос", "Пусто")}
                </td>
              </tr>
            ) : (
              items.map((t) => (
                <tr key={t.id} className="cursor-pointer border-t border-gray-100 hover:bg-gray-50" onClick={() => openEdit(t)}>
                  <td className="px-3 py-2 capitalize">{t.platform}</td>
                  <td className="px-3 py-2">
                    {t.kind === "news" ? T("Жаңалық", "Новость") : T("Іс-шара", "Событие")}
                  </td>
                  <td className="px-3 py-2 font-medium">{t.name}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {t.is_active ? T("Белсенді", "Активен") : T("Өшірілген", "Выключен")}
                    </span>
                  </td>
                  <td className="px-3 py-2">{t.is_default ? "⭐" : ""}</td>
                  <td className="px-3 py-2 text-right text-xs text-gray-400">
                    {T("Ашу →", "Открыть →")}
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
            onSubmit={onSave}
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-xl space-y-4 overflow-auto bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold">
              {editing
                ? T("Шаблонды өңдеу", "Редактирование шаблона")
                : T("Жаңа шаблон", "Новый шаблон")}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-700">
                  {T("Платформа", "Платформа")}
                </span>
                <select
                  disabled={!!editing}
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                >
                  <option value="telegram">Telegram</option>
                  <option value="instagram">Instagram</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-700">
                  {T("Түр", "Тип")}
                </span>
                <select
                  disabled={!!editing}
                  value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value as Kind })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                >
                  <option value="news">{T("Жаңалық", "Новость")}</option>
                  <option value="event">{T("Іс-шара", "Событие")}</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-700">
                {T("Атауы", "Название")}
              </span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>

            <div className="rounded-lg bg-gray-50 p-3 text-xs">
              <div className="mb-1 font-semibold text-gray-700">
                {T("Қолжетімді жолсілтеушілер:", "Доступные плейсхолдеры:")}
              </div>
              <div className="flex flex-wrap gap-1">
                {placeholders.map((p) => (
                  <code key={p} className="rounded bg-white px-2 py-0.5 font-mono">
                    {`{{${p}}}`}
                  </code>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-700">
                {T("Мәтін (RU)", "Текст (RU)")}
                {form.platform === "telegram" && (
                  <span className="ml-2 text-gray-400">HTML: &lt;b&gt;, &lt;a&gt;</span>
                )}
              </span>
              <textarea
                rows={6}
                value={form.body_ru}
                onChange={(e) => setForm({ ...form, body_ru: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-700">
                {T("Мәтін (KK)", "Текст (KK)")}
              </span>
              <textarea
                rows={6}
                value={form.body_kk}
                onChange={(e) => setForm({ ...form, body_kk: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
              />
            </label>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                />
                <span className="text-sm">
                  {T("Үнсіз келісім бойынша қолдану", "Использовать по умолчанию")}
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <span className="text-sm">{T("Белсенді", "Активен")}</span>
              </label>
            </div>

            {formErr && <div className="text-sm text-red-600">{formErr}</div>}

            <div className="flex items-center justify-between gap-2 pt-2">
              <div>
                {editing && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    {T("Жою", "Удалить")}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
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
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
