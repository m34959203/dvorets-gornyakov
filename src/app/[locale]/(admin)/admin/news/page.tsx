"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

type NewsStatus = "draft" | "published" | "archived";

interface NewsItem {
  id: string;
  slug: string;
  title_kk: string;
  title_ru: string;
  content_kk: string;
  content_ru: string;
  excerpt_kk: string | null;
  excerpt_ru: string | null;
  image_url: string | null;
  video_url: string | null;
  embed_code: string | null;
  category: string | null;
  status: NewsStatus;
  published_at: string | null;
  created_at: string;
}

interface FormState {
  title_kk: string;
  title_ru: string;
  content_kk: string;
  content_ru: string;
  excerpt_kk: string;
  excerpt_ru: string;
  image_url: string;
  video_url: string;
  embed_code: string;
  category: string;
  status: NewsStatus;
}

const EMPTY_FORM: FormState = {
  title_kk: "",
  title_ru: "",
  content_kk: "",
  content_ru: "",
  excerpt_kk: "",
  excerpt_ru: "",
  image_url: "",
  video_url: "",
  embed_code: "",
  category: "general",
  status: "draft",
};

type TranslateField = "title" | "excerpt" | "content";
type TranslateDir = "ru2kk" | "kk2ru";
type TranslateKey = `${TranslateField}_${TranslateDir}`;

const STATUSES: NewsStatus[] = ["draft", "published", "archived"];

const STATUS_LABELS: Record<NewsStatus, { kk: string; ru: string }> = {
  draft: { kk: "Жоба", ru: "Черновик" },
  published: { kk: "Жарияланған", ru: "Опубликовано" },
  archived: { kk: "Мұрағат", ru: "В архиве" },
};

const STATUS_COLORS: Record<NewsStatus, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-gray-200 text-gray-700",
};

const NEXT_STATUS: Record<NewsStatus, NewsStatus> = {
  draft: "published",
  published: "archived",
  archived: "draft",
};

export default function AdminNewsPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";

  const [statusFilter, setStatusFilter] = useState<"" | NewsStatus>("");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState<Record<TranslateKey, boolean>>({
    title_ru2kk: false,
    title_kk2ru: false,
    excerpt_ru2kk: false,
    excerpt_kk2ru: false,
    content_ru2kk: false,
    content_kk2ru: false,
  });
  const [translateErr, setTranslateErr] = useState<Record<TranslateKey, string>>({
    title_ru2kk: "",
    title_kk2ru: "",
    excerpt_ru2kk: "",
    excerpt_kk2ru: "",
    content_ru2kk: "",
    content_kk2ru: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    setUnauthorized(false);
    try {
      const url = `/api/admin/news${statusFilter ? `?status=${statusFilter}` : ""}`;
      const r = await fetch(url);
      if (r.status === 401 || r.status === 403) {
        setUnauthorized(true);
        setItems([]);
        return;
      }
      const body = await r.json();
      if (!r.ok) {
        setErr(body.error || (locale === "kk" ? "Жүктеу қатесі" : "Ошибка загрузки"));
        return;
      }
      const list = (body.data?.items ?? []) as NewsItem[];
      setItems(list);
    } catch {
      setErr(locale === "kk" ? "Желі қатесі" : "Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, locale]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErr("");
    setDrawerOpen(true);
  };

  const openEdit = async (row: NewsItem) => {
    setFormErr("");
    setDrawerOpen(true);
    setEditing(row);
    setForm({
      title_kk: row.title_kk,
      title_ru: row.title_ru,
      content_kk: row.content_kk,
      content_ru: row.content_ru,
      excerpt_kk: row.excerpt_kk || "",
      excerpt_ru: row.excerpt_ru || "",
      image_url: row.image_url || "",
      video_url: row.video_url || "",
      embed_code: row.embed_code || "",
      category: row.category || "general",
      status: row.status,
    });
    // refetch latest
    try {
      const r = await fetch(`/api/news/${row.id}`);
      if (r.ok) {
        const body = await r.json();
        const fresh = body.data as NewsItem;
        setEditing(fresh);
        setForm({
          title_kk: fresh.title_kk,
          title_ru: fresh.title_ru,
          content_kk: fresh.content_kk,
          content_ru: fresh.content_ru,
          excerpt_kk: fresh.excerpt_kk || "",
          excerpt_ru: fresh.excerpt_ru || "",
          image_url: fresh.image_url || "",
          video_url: fresh.video_url || "",
          embed_code: fresh.embed_code || "",
          category: fresh.category || "general",
          status: fresh.status,
        });
      }
    } catch {
      // keep the row data
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
    setFormErr("");
  };

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setFormErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const body = await r.json();
      if (!r.ok) {
        setFormErr(body.error || (locale === "kk" ? "Жүктеу қатесі" : "Ошибка загрузки"));
        return;
      }
      const url = (body.data?.url as string) || "";
      setForm((f) => ({ ...f, image_url: url }));
    } catch {
      setFormErr(locale === "kk" ? "Желі қатесі" : "Сетевая ошибка");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErr("");
    const payload = {
      title_kk: form.title_kk,
      title_ru: form.title_ru,
      content_kk: form.content_kk,
      content_ru: form.content_ru,
      excerpt_kk: form.excerpt_kk || undefined,
      excerpt_ru: form.excerpt_ru || undefined,
      image_url: form.image_url || "",
      video_url: form.video_url || "",
      embed_code: form.embed_code || "",
      category: form.category || undefined,
      status: form.status,
    };
    try {
      const url = editing ? `/api/news/${editing.id}` : `/api/news`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await r.json();
      if (!r.ok) {
        setFormErr(body.error || (locale === "kk" ? "Сақтау қатесі" : "Ошибка сохранения"));
        return;
      }
      closeDrawer();
      await load();
    } catch {
      setFormErr(locale === "kk" ? "Желі қатесі" : "Сетевая ошибка");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!editing) return;
    const ok = confirm(locale === "kk" ? "Жоюды растайсыз ба?" : "Подтвердите удаление");
    if (!ok) return;
    try {
      const r = await fetch(`/api/news/${editing.id}`, { method: "DELETE" });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        setFormErr(body.error || (locale === "kk" ? "Жою қатесі" : "Ошибка удаления"));
        return;
      }
      closeDrawer();
      await load();
    } catch {
      setFormErr(locale === "kk" ? "Желі қатесі" : "Сетевая ошибка");
    }
  };

  const translate = async (field: TranslateField, dir: TranslateDir) => {
    const key: TranslateKey = `${field}_${dir}`;
    const from = dir === "ru2kk" ? "ru" : "kk";
    const to = dir === "ru2kk" ? "kk" : "ru";
    const srcKey = `${field}_${from}` as
      | "title_ru"
      | "title_kk"
      | "excerpt_ru"
      | "excerpt_kk"
      | "content_ru"
      | "content_kk";
    const dstKey = `${field}_${to}` as typeof srcKey;
    const text = form[srcKey];
    if (!text || !text.trim()) {
      setTranslateErr((s) => ({
        ...s,
        [key]: locale === "kk" ? "Бастапқы мәтін бос" : "Исходный текст пустой",
      }));
      return;
    }
    setTranslating((s) => ({ ...s, [key]: true }));
    setTranslateErr((s) => ({ ...s, [key]: "" }));
    try {
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
      });
      const body = await r.json();
      if (!r.ok) {
        setTranslateErr((s) => ({
          ...s,
          [key]: body.error || (locale === "kk" ? "Аударма қатесі" : "Ошибка перевода"),
        }));
        return;
      }
      const translated = (body.data?.translated as string) || "";
      setForm((f) => ({ ...f, [dstKey]: translated }));
    } catch {
      setTranslateErr((s) => ({
        ...s,
        [key]: locale === "kk" ? "Желі қатесі" : "Сетевая ошибка",
      }));
    } finally {
      setTranslating((s) => ({ ...s, [key]: false }));
    }
  };

  const cycleStatus = async (row: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = NEXT_STATUS[row.status];
    try {
      const r = await fetch(`/api/news/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        alert(body.error || (locale === "kk" ? "Қате" : "Ошибка"));
        return;
      }
      await load();
    } catch {
      alert(locale === "kk" ? "Желі қатесі" : "Сетевая ошибка");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "kk" ? "Жаңалықтар" : "Новости"}
        </h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          {locale === "kk" ? "Жаңа" : "Новая"}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterPill active={statusFilter === ""} onClick={() => setStatusFilter("")}>
          {locale === "kk" ? "Барлығы" : "Все"}
        </FilterPill>
        {STATUSES.map((s) => (
          <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
            {STATUS_LABELS[s][locale]}
          </FilterPill>
        ))}
      </div>

      {unauthorized && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {locale === "kk" ? "Кіру рұқсаты жоқ" : "Нет доступа (Unauthorized)"}
        </div>
      )}
      {err && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>{locale === "kk" ? "Мәртебе" : "Статус"}</Th>
              <Th>{locale === "kk" ? "Мұқаба" : "Обложка"}</Th>
              <Th>{locale === "kk" ? "Тақырып (RU)" : "Заголовок (RU)"}</Th>
              <Th>{locale === "kk" ? "Санат" : "Категория"}</Th>
              <Th>{locale === "kk" ? "Құрылған" : "Создано"}</Th>
              <Th>{locale === "kk" ? "Әрекеттер" : "Действия"}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  …
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  —
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr
                  key={it.id}
                  onClick={() => openEdit(it)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => cycleStatus(it, e)}
                      title={locale === "kk" ? "Мәртебені ауыстыру" : "Сменить статус"}
                      className={
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium hover:ring-2 hover:ring-primary/40 " +
                        STATUS_COLORS[it.status]
                      }
                    >
                      {STATUS_LABELS[it.status][locale]}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {it.image_url ? (
                      <div className="relative h-10 w-14 overflow-hidden rounded bg-gray-100">
                        <Image
                          src={it.image_url}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="max-w-md truncate px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{it.title_ru}</span>
                      {(it.video_url || (it.embed_code && it.embed_code.trim())) && (
                        <span
                          title={locale === "kk" ? "Бейне" : "Видео"}
                          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-3 w-3"
                            aria-hidden="true"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{it.category || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {new Date(it.created_at).toLocaleDateString(locale === "kk" ? "kk-KZ" : "ru-RU")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(it);
                      }}
                      className="text-sm font-medium text-primary hover:text-primary-dark"
                    >
                      {locale === "kk" ? "Өңдеу" : "Изменить"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex" onClick={closeDrawer}>
          <div className="flex-1 bg-black/40" />
          <div
            className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editing
                  ? locale === "kk"
                    ? "Жаңалықты өңдеу"
                    : "Редактировать новость"
                  : locale === "kk"
                  ? "Жаңа жаңалық"
                  : "Новая новость"}
              </h2>
              <button
                onClick={closeDrawer}
                className="text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {formErr && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formErr}</div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldWithTranslate
                  label={locale === "kk" ? "Тақырып (KK)" : "Заголовок (KK)"}
                  translateLabel="→ RU"
                  translating={translating.title_kk2ru}
                  error={translateErr.title_kk2ru}
                  onTranslate={() => translate("title", "kk2ru")}
                >
                  <input
                    required
                    value={form.title_kk}
                    onChange={(e) => setForm({ ...form, title_kk: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </FieldWithTranslate>
                <FieldWithTranslate
                  label={locale === "kk" ? "Тақырып (RU)" : "Заголовок (RU)"}
                  translateLabel="→ KK"
                  translating={translating.title_ru2kk}
                  error={translateErr.title_ru2kk}
                  onTranslate={() => translate("title", "ru2kk")}
                >
                  <input
                    required
                    value={form.title_ru}
                    onChange={(e) => setForm({ ...form, title_ru: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </FieldWithTranslate>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldWithTranslate
                  label={locale === "kk" ? "Қысқаша (KK)" : "Краткое описание (KK)"}
                  translateLabel="→ RU"
                  translating={translating.excerpt_kk2ru}
                  error={translateErr.excerpt_kk2ru}
                  onTranslate={() => translate("excerpt", "kk2ru")}
                >
                  <input
                    value={form.excerpt_kk}
                    onChange={(e) => setForm({ ...form, excerpt_kk: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </FieldWithTranslate>
                <FieldWithTranslate
                  label={locale === "kk" ? "Қысқаша (RU)" : "Краткое описание (RU)"}
                  translateLabel="→ KK"
                  translating={translating.excerpt_ru2kk}
                  error={translateErr.excerpt_ru2kk}
                  onTranslate={() => translate("excerpt", "ru2kk")}
                >
                  <input
                    value={form.excerpt_ru}
                    onChange={(e) => setForm({ ...form, excerpt_ru: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </FieldWithTranslate>
              </div>

              <FieldWithTranslate
                label={locale === "kk" ? "Мазмұны (KK)" : "Содержание (KK)"}
                translateLabel="→ RU"
                translating={translating.content_kk2ru}
                error={translateErr.content_kk2ru}
                onTranslate={() => translate("content", "kk2ru")}
              >
                <textarea
                  required
                  rows={8}
                  value={form.content_kk}
                  onChange={(e) => setForm({ ...form, content_kk: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </FieldWithTranslate>
              <FieldWithTranslate
                label={locale === "kk" ? "Мазмұны (RU)" : "Содержание (RU)"}
                translateLabel="→ KK"
                translating={translating.content_ru2kk}
                error={translateErr.content_ru2kk}
                onTranslate={() => translate("content", "ru2kk")}
              >
                <textarea
                  required
                  rows={8}
                  value={form.content_ru}
                  onChange={(e) => setForm({ ...form, content_ru: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </FieldWithTranslate>

              <Field label={locale === "kk" ? "Сурет" : "Изображение"}>
                <div className="space-y-2">
                  {form.image_url && (
                    <div className="relative h-32 w-48 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={form.image_url}
                        alt=""
                        fill
                        sizes="192px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={handleFilePick}
                      disabled={uploading}
                      className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                    >
                      {uploading
                        ? locale === "kk"
                          ? "Жүктелуде…"
                          : "Загрузка…"
                        : locale === "kk"
                        ? "Файл таңдау"
                        : "Выбрать файл"}
                    </button>
                    {form.image_url && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_url: "" })}
                        className="text-sm text-red-600 hover:underline"
                      >
                        {locale === "kk" ? "Өшіру" : "Удалить"}
                      </button>
                    )}
                  </div>
                  <input
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="/uploads/..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
                  />
                </div>
              </Field>

              <Field label={locale === "kk" ? "Бейне сілтемесі (MP4)" : "Ссылка на видео (MP4)"}>
                <input
                  type="url"
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://.../video.mp4"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </Field>

              <Field label="HTML embed (YouTube/Vimeo)">
                <textarea
                  rows={5}
                  value={form.embed_code}
                  onChange={(e) => setForm({ ...form, embed_code: e.target.value })}
                  placeholder="<iframe ...></iframe>"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={locale === "kk" ? "Санат" : "Категория"}>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </Field>
                <Field label={locale === "kk" ? "Мәртебе" : "Статус"}>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as NewsStatus })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s][locale]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4">
                <div>
                  {editing && (
                    <button
                      type="button"
                      onClick={onDelete}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      {locale === "kk" ? "Жою" : "Удалить"}
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    {locale === "kk" ? "Болдырмау" : "Отмена"}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                  >
                    {saving
                      ? locale === "kk"
                        ? "Сақталуда…"
                        : "Сохранение…"
                      : editing
                      ? locale === "kk"
                        ? "Сақтау"
                        : "Сохранить"
                      : locale === "kk"
                      ? "Құру"
                      : "Создать"}
                  </button>
                </div>
              </div>
            </form>
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

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full px-4 py-1.5 text-sm font-medium " +
        (active ? "bg-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200")
      }
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function FieldWithTranslate({
  label,
  translateLabel,
  translating,
  error,
  onTranslate,
  children,
}: {
  label: string;
  translateLabel: string;
  translating: boolean;
  error: string;
  onTranslate: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
          type="button"
          onClick={onTranslate}
          disabled={translating}
          className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {translating ? "…" : translateLabel}
        </button>
      </div>
      {children}
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </div>
  );
}
