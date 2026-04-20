"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

type MediaType = "all" | "image" | "video" | "other";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mime_type: string;
  size: number;
  original_name: string;
  width: number | null;
  height: number | null;
  alt_kk: string;
  alt_ru: string;
  created_at: string;
}

interface UploadProgress {
  name: string;
  status: "pending" | "done" | "error" | "dedup";
  error?: string;
}

const LIMIT = 24;

export default function AdminMediaPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";

  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [type, setType] = useState<MediaType>("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [drag, setDrag] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [active, setActive] = useState<MediaItem | null>(null);
  const [editAltKk, setEditAltKk] = useState("");
  const [editAltRu, setEditAltRu] = useState("");
  const [editOriginalName, setEditOriginalName] = useState("");
  const [saving, setSaving] = useState(false);
  const [drawerErr, setDrawerErr] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    setUnauthorized(false);
    try {
      const qs = new URLSearchParams({
        q,
        type,
        page: String(page),
        limit: String(LIMIT),
      });
      const r = await fetch(`/api/admin/media?${qs.toString()}`, { cache: "no-store" });
      const body = await r.json();
      if (r.status === 401 || r.status === 403) {
        setUnauthorized(true);
        return;
      }
      if (!r.ok) {
        setErr(body.error || (locale === "kk" ? "Қате" : "Ошибка загрузки"));
        return;
      }
      setItems(body.data?.items ?? []);
      setTotal(body.data?.total ?? 0);
    } catch {
      setErr(locale === "kk" ? "Желі қатесі" : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [q, type, page, locale]);

  useEffect(() => {
    load();
  }, [load]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQ(qInput.trim());
  };

  const onChangeType = (t: MediaType) => {
    setPage(1);
    setType(t);
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    setUploads(list.map((f) => ({ name: f.name, status: "pending" })));
    try {
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        try {
          const fd = new FormData();
          fd.append("file", file);
          const r = await fetch("/api/upload", { method: "POST", body: fd });
          const body = await r.json();
          if (!r.ok) {
            setUploads((prev) => {
              const next = [...prev];
              next[i] = { name: file.name, status: "error", error: body.error || "Error" };
              return next;
            });
          } else if (body.data?.deduplicated) {
            setUploads((prev) => {
              const next = [...prev];
              next[i] = { name: file.name, status: "dedup" };
              return next;
            });
          } else {
            setUploads((prev) => {
              const next = [...prev];
              next[i] = { name: file.name, status: "done" };
              return next;
            });
          }
        } catch (e) {
          setUploads((prev) => {
            const next = [...prev];
            next[i] = { name: file.name, status: "error", error: (e as Error).message };
            return next;
          });
        }
      }
      await load();
    } finally {
      setUploading(false);
      // Убираем прогресс через 2.5с после завершения
      setTimeout(() => setUploads([]), 2500);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      uploadFiles(e.target.files);
    }
  };

  const openDrawer = (m: MediaItem) => {
    setActive(m);
    setEditAltKk(m.alt_kk || "");
    setEditAltRu(m.alt_ru || "");
    setEditOriginalName(m.original_name || "");
    setDrawerErr("");
    setCopied(false);
  };

  const closeDrawer = () => {
    setActive(null);
    setDrawerErr("");
    setCopied(false);
  };

  const onSave = async () => {
    if (!active) return;
    setSaving(true);
    setDrawerErr("");
    try {
      const r = await fetch(`/api/admin/media/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alt_kk: editAltKk,
          alt_ru: editAltRu,
          original_name: editOriginalName,
        }),
      });
      const body = await r.json();
      if (!r.ok) {
        setDrawerErr(body.error || (locale === "kk" ? "Қате" : "Ошибка"));
        return;
      }
      // Обновляем локально и в списке
      const updated: MediaItem = body.data;
      setActive(updated);
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch {
      setDrawerErr(locale === "kk" ? "Желі қатесі" : "Сетевая ошибка");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!active) return;
    const msg = locale === "kk" ? "Файлды жоясыз ба?" : "Удалить файл?";
    if (!confirm(msg)) return;
    try {
      const r = await fetch(`/api/admin/media/${active.id}`, { method: "DELETE" });
      const body = await r.json();
      if (!r.ok) {
        setDrawerErr(body.error || (locale === "kk" ? "Қате" : "Ошибка"));
        return;
      }
      setItems((prev) => prev.filter((x) => x.id !== active.id));
      setTotal((t) => Math.max(0, t - 1));
      closeDrawer();
    } catch {
      setDrawerErr(locale === "kk" ? "Желі қатесі" : "Сетевая ошибка");
    }
  };

  const copyUrl = async () => {
    if (!active) return;
    try {
      const full =
        typeof window !== "undefined" && active.url.startsWith("/")
          ? window.location.origin + active.url
          : active.url;
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setDrawerErr(locale === "kk" ? "Көшіру сәтсіз" : "Не удалось скопировать");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

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
          {locale === "kk" ? "Медиакітапхана" : "Медиабиблиотека"}
        </h1>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,video/*,application/pdf"
            onChange={onFileInput}
            disabled={uploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {uploading
              ? locale === "kk"
                ? "Жүктелуде…"
                : "Загрузка…"
              : locale === "kk"
              ? "Файлдарды таңдау"
              : "Выбрать файлы"}
          </button>
        </div>
      </div>

      <form onSubmit={onSearch} className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          placeholder={locale === "kk" ? "Аты бойынша іздеу…" : "Поиск по имени…"}
          className="min-w-[220px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          {locale === "kk" ? "Іздеу" : "Найти"}
        </button>
        <div className="flex rounded-lg border border-gray-300 bg-white text-sm">
          {(["all", "image", "video", "other"] as MediaType[]).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => onChangeType(t)}
              className={
                "px-3 py-2 transition-colors " +
                (type === t ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100")
              }
            >
              {TYPE_LABEL[t][locale]}
            </button>
          ))}
        </div>
      </form>

      {err && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      {uploads.length > 0 && (
        <div className="mb-4 space-y-1 rounded-lg border border-gray-200 bg-white p-3 text-xs">
          {uploads.map((u, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="truncate text-gray-700">{u.name}</span>
              <span
                className={
                  u.status === "done"
                    ? "text-emerald-600"
                    : u.status === "dedup"
                    ? "text-blue-600"
                    : u.status === "error"
                    ? "text-red-600"
                    : "text-gray-500"
                }
              >
                {u.status === "done"
                  ? locale === "kk"
                    ? "Дайын"
                    : "Готово"
                  : u.status === "dedup"
                  ? locale === "kk"
                    ? "Бар"
                    : "Уже загружен"
                  : u.status === "error"
                  ? u.error || (locale === "kk" ? "Қате" : "Ошибка")
                  : locale === "kk"
                  ? "Жүктелуде…"
                  : "Загрузка…"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!drag) setDrag(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDrag(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length) {
            uploadFiles(e.dataTransfer.files);
          }
        }}
        className={
          "rounded-2xl border-2 border-dashed p-4 transition-colors " +
          (drag ? "border-primary bg-primary/5" : "border-gray-200 bg-white")
        }
      >
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">
            {locale === "kk" ? "Жүктелуде…" : "Загрузка…"}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            {locale === "kk"
              ? "Файлдарды осында тасымалдаңыз немесе «Файлдарды таңдау» басыңыз"
              : "Перетащите файлы сюда или нажмите «Выбрать файлы»"}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((m) => (
              <button
                key={m.id}
                onClick={() => openDrawer(m)}
                className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition-all hover:border-primary hover:shadow-sm"
                title={m.original_name || m.filename}
              >
                {m.mime_type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url}
                    alt={locale === "kk" ? m.alt_kk || m.original_name : m.alt_ru || m.original_name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : m.mime_type.startsWith("video/") ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-gray-500">
                    <span className="text-2xl">▶</span>
                    <span className="break-all text-[10px]">{m.original_name || m.filename}</span>
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-gray-500">
                    <span className="text-2xl">📄</span>
                    <span className="break-all text-[10px]">{m.original_name || m.filename}</span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="truncate">{m.original_name || m.filename}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {!loading && total > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            {locale === "kk" ? "Барлығы" : "Всего"}: {total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 disabled:opacity-50"
            >
              ←
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      )}

      {active && (
        <div className="fixed inset-0 z-50 flex" onClick={closeDrawer}>
          <div className="flex-1 bg-black/40" />
          <div
            className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="truncate text-lg font-bold text-gray-900">
                {active.original_name || active.filename}
              </h2>
              <button
                onClick={closeDrawer}
                className="text-gray-400 hover:text-gray-700"
                aria-label="close"
              >
                ✕
              </button>
            </div>

            {drawerErr && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{drawerErr}</div>
            )}

            <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {active.mime_type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={active.url}
                  alt={active.alt_ru || active.original_name}
                  className="max-h-80 w-full object-contain"
                />
              ) : active.mime_type.startsWith("video/") ? (
                <video
                  src={active.url}
                  controls
                  className="max-h-80 w-full"
                />
              ) : (
                <div className="flex h-40 flex-col items-center justify-center text-sm text-gray-500">
                  <span className="mb-2 text-4xl">📄</span>
                  <a
                    href={active.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {locale === "kk" ? "Ашу" : "Открыть"}
                  </a>
                </div>
              )}
            </div>

            <div className="mb-4 text-xs text-gray-500">
              {active.width && active.height ? `${active.width}×${active.height} · ` : ""}
              {(active.size / 1024).toFixed(1)} KB · {active.mime_type}
            </div>

            <div className="space-y-4">
              <Field label="URL">
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={active.url}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="whitespace-nowrap rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    {copied
                      ? locale === "kk"
                        ? "Көшірілді"
                        : "Скопировано"
                      : locale === "kk"
                      ? "Көшіру"
                      : "Копировать"}
                  </button>
                </div>
              </Field>

              <Field label={locale === "kk" ? "Түпнұсқа аты" : "Оригинальное имя"}>
                <input
                  value={editOriginalName}
                  onChange={(e) => setEditOriginalName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>

              <Field label="Alt (KK)">
                <input
                  value={editAltKk}
                  onChange={(e) => setEditAltKk(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>

              <Field label="Alt (RU)">
                <input
                  value={editAltRu}
                  onChange={(e) => setEditAltRu(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                {locale === "kk" ? "Жою" : "Удалить"}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  {locale === "kk" ? "Жабу" : "Закрыть"}
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                >
                  {saving
                    ? locale === "kk"
                      ? "Сақталуда…"
                      : "Сохранение…"
                    : locale === "kk"
                    ? "Сақтау"
                    : "Сохранить"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TYPE_LABEL: Record<MediaType, { kk: string; ru: string }> = {
  all: { kk: "Барлығы", ru: "Все" },
  image: { kk: "Суреттер", ru: "Изображения" },
  video: { kk: "Видео", ru: "Видео" },
  other: { kk: "Басқа", ru: "Другое" },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
