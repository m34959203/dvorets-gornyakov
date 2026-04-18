"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

type Position = "hero" | "sidebar" | "footer" | "other";

const POSITIONS: Position[] = ["hero", "sidebar", "footer", "other"];

const POSITION_LABELS: Record<Position, { kk: string; ru: string }> = {
  hero: { kk: "Hero", ru: "Hero" },
  sidebar: { kk: "Бүйір", ru: "Сайдбар" },
  footer: { kk: "Футер", ru: "Футер" },
  other: { kk: "Басқа", ru: "Другое" },
};

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  position: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

interface FormState {
  title: string;
  image_url: string;
  link_url: string;
  position: Position;
  is_active: boolean;
  sort_order: number;
}

const EMPTY_FORM: FormState = {
  title: "",
  image_url: "",
  link_url: "",
  position: "hero",
  is_active: true,
  sort_order: 0,
};

export default function AdminBannersPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";

  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    setUnauthorized(false);
    try {
      const r = await fetch("/api/admin/banners");
      const body = await r.json();
      if (r.status === 401 || r.status === 403) {
        setUnauthorized(true);
        return;
      }
      if (!r.ok) {
        setErr(body.error || "Ошибка загрузки");
        return;
      }
      setItems(body.data?.items ?? []);
    } catch {
      setErr("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    const nextSort = items.length ? Math.max(...items.map((b) => b.sort_order)) + 10 : 10;
    setForm({ ...EMPTY_FORM, sort_order: nextSort });
    setFormErr("");
    setDrawerOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b);
    const pos = (POSITIONS as string[]).includes(b.position) ? (b.position as Position) : "other";
    setForm({
      title: b.title ?? "",
      image_url: b.image_url ?? "",
      link_url: b.link_url ?? "",
      position: pos,
      is_active: b.is_active,
      sort_order: b.sort_order ?? 0,
    });
    setFormErr("");
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFormErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const body = await r.json();
      if (!r.ok) {
        setFormErr(body.error || "Ошибка загрузки файла");
        return;
      }
      setForm((f) => ({ ...f, image_url: body.data?.url ?? "" }));
    } catch {
      setFormErr("Ошибка загрузки файла");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSave = async () => {
    setFormErr("");
    if (!form.image_url) {
      setFormErr(locale === "kk" ? "Суретті жүктеңіз" : "Загрузите изображение");
      return;
    }
    const payload = {
      title: form.title,
      image_url: form.image_url,
      link_url: form.link_url || "",
      position: form.position,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };
    setSaving(true);
    try {
      const url = editing ? `/api/banners/${editing.id}` : "/api/banners";
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await r.json();
      if (!r.ok) {
        setFormErr(body.error || "Ошибка сохранения");
        return;
      }
      closeDrawer();
      load();
    } catch {
      setFormErr("Сетевая ошибка");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (b: Banner, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const msg = locale === "kk" ? "Шынымен жоясыз ба?" : "Удалить баннер?";
    if (!confirm(msg)) return;
    try {
      const r = await fetch(`/api/banners/${b.id}`, { method: "DELETE" });
      const body = await r.json();
      if (!r.ok) {
        alert(body.error || "Ошибка");
        return;
      }
      if (editing?.id === b.id) closeDrawer();
      load();
    } catch {
      alert("Сетевая ошибка");
    }
  };

  const onToggleActive = async (b: Banner, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const r = await fetch(`/api/banners/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !b.is_active }),
      });
      const body = await r.json();
      if (!r.ok) {
        alert(body.error || "Ошибка");
        return;
      }
      load();
    } catch {
      alert("Сетевая ошибка");
    }
  };

  const onChangeSort = async (b: Banner, dir: -1 | 1, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = (b.sort_order ?? 0) + dir * 10;
    try {
      const r = await fetch(`/api/banners/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: next }),
      });
      const body = await r.json();
      if (!r.ok) {
        alert(body.error || "Ошибка");
        return;
      }
      load();
    } catch {
      alert("Сетевая ошибка");
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "kk" ? "Баннерлер" : "Баннеры"}
        </h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          {locale === "kk" ? "Жаңа" : "Создать"}
        </button>
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th><span className="sr-only">drag</span></Th>
              <Th>{locale === "kk" ? "Сурет" : "Фото"}</Th>
              <Th>{locale === "kk" ? "Тақырып" : "Заголовок"}</Th>
              <Th>{locale === "kk" ? "Орналасуы" : "Позиция"}</Th>
              <Th>{locale === "kk" ? "Сілтеме" : "Ссылка"}</Th>
              <Th>{locale === "kk" ? "Реті" : "Порядок"}</Th>
              <Th>{locale === "kk" ? "Белсенді" : "Активен"}</Th>
              <Th>{locale === "kk" ? "Әрекет" : "Действия"}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={8} className="p-6 text-center text-gray-400">…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="p-6 text-center text-gray-400">—</td></tr>
            ) : (
              items.map((b) => {
                const posKey = (POSITIONS as string[]).includes(b.position) ? (b.position as Position) : null;
                return (
                  <tr
                    key={b.id}
                    onClick={() => openEdit(b)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-3 py-3 text-center text-gray-300 select-none">≡</td>
                    <td className="px-4 py-3">
                      {b.image_url ? (
                        <div className="relative h-12 w-20 overflow-hidden rounded-lg bg-gray-100">
                          <Image src={b.image_url} alt="" fill className="object-cover" sizes="80px" unoptimized />
                        </div>
                      ) : (
                        <div className="h-12 w-20 rounded-lg bg-gray-100" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{b.title}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {posKey ? POSITION_LABELS[posKey][locale] : b.position}
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-gray-600">
                      {b.link_url || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => onChangeSort(b, -1, e)}
                          className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
                          aria-label="up"
                        >
                          ↑
                        </button>
                        <span className="w-8 text-center text-gray-700">{b.sort_order}</span>
                        <button
                          onClick={(e) => onChangeSort(b, 1, e)}
                          className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
                          aria-label="down"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => onToggleActive(b, e)}
                        className={
                          "w-10 h-6 rounded-full transition-colors " +
                          (b.is_active ? "bg-emerald-500" : "bg-gray-300")
                        }
                        aria-label="toggle"
                      >
                        <span
                          className={
                            "block w-4 h-4 bg-white rounded-full shadow transform transition-transform " +
                            (b.is_active ? "translate-x-5" : "translate-x-1")
                          }
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => onDelete(b, e)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        {locale === "kk" ? "Жою" : "Удалить"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex" onClick={closeDrawer}>
          <div className="flex-1 bg-black/40" />
          <div
            className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editing
                  ? (locale === "kk" ? "Баннерді өзгерту" : "Редактировать баннер")
                  : (locale === "kk" ? "Жаңа баннер" : "Новый баннер")}
              </h2>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            {formErr && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formErr}</div>}

            <div className="grid grid-cols-1 gap-4">
              <Field label={locale === "kk" ? "Тақырып" : "Заголовок"}>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>

              <Field label={locale === "kk" ? "Сурет" : "Изображение"}>
                <div className="flex items-center gap-3">
                  {form.image_url ? (
                    <div className="relative h-16 w-28 overflow-hidden rounded-lg bg-gray-100">
                      <Image src={form.image_url} alt="" fill className="object-cover" sizes="112px" unoptimized />
                    </div>
                  ) : (
                    <div className="h-16 w-28 rounded-lg bg-gray-100" />
                  )}
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFileChange}
                    />
                    <button
                      type="button"
                      onClick={onUploadClick}
                      disabled={uploading}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60"
                    >
                      {uploading
                        ? (locale === "kk" ? "Жүктелуде…" : "Загрузка…")
                        : (locale === "kk" ? "Суретті жүктеу" : "Загрузить")}
                    </button>
                    {form.image_url && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_url: "" })}
                        className="text-xs text-red-600 hover:underline"
                      >
                        {locale === "kk" ? "Жою" : "Удалить"}
                      </button>
                    )}
                  </div>
                </div>
                {form.image_url && (
                  <div className="mt-1 truncate text-xs text-gray-500">{form.image_url}</div>
                )}
              </Field>

              <Field label={locale === "kk" ? "Сілтеме (міндетті емес)" : "Ссылка (опционально)"}>
                <input
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>

              <Field label={locale === "kk" ? "Орналасуы" : "Позиция"}>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value as Position })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>{POSITION_LABELS[p][locale]}</option>
                  ))}
                </select>
              </Field>

              <Field label={locale === "kk" ? "Реті" : "Порядок"}>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>

              <Field label={locale === "kk" ? "Белсенді" : "Активен"}>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">
                    {form.is_active
                      ? (locale === "kk" ? "Иә" : "Да")
                      : (locale === "kk" ? "Жоқ" : "Нет")}
                  </span>
                </label>
              </Field>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                {editing && (
                  <button
                    type="button"
                    onClick={() => onDelete(editing)}
                    className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    {locale === "kk" ? "Жою" : "Удалить"}
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  {locale === "kk" ? "Болдырмау" : "Отмена"}
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                >
                  {saving
                    ? (locale === "kk" ? "Сақталуда…" : "Сохранение…")
                    : (locale === "kk" ? "Сақтау" : "Сохранить")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">{children}</th>;
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={"block " + (className ?? "")}>
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
