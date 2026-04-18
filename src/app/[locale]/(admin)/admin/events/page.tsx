"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
type EventType = "concert" | "exhibition" | "workshop" | "festival" | "competition" | "other";

interface EventItem {
  id: string;
  title_kk: string;
  title_ru: string;
  description_kk: string;
  description_ru: string;
  image_url: string | null;
  event_type: EventType;
  start_date: string;
  end_date: string | null;
  location: string | null;
  status: EventStatus;
  created_at: string;
}

interface FormState {
  title_kk: string;
  title_ru: string;
  description_kk: string;
  description_ru: string;
  image_url: string;
  event_type: EventType;
  start_date: string; // datetime-local value (YYYY-MM-DDTHH:mm)
  end_date: string; // datetime-local or ""
  location: string;
  status: EventStatus;
}

const EMPTY_FORM: FormState = {
  title_kk: "",
  title_ru: "",
  description_kk: "",
  description_ru: "",
  image_url: "",
  event_type: "concert",
  start_date: "",
  end_date: "",
  location: "",
  status: "upcoming",
};

const STATUSES: EventStatus[] = ["upcoming", "ongoing", "completed", "cancelled"];
const TYPES: EventType[] = ["concert", "exhibition", "workshop", "festival", "competition", "other"];

const STATUS_LABELS: Record<EventStatus, { kk: string; ru: string }> = {
  upcoming: { kk: "Алдағы", ru: "Предстоящее" },
  ongoing: { kk: "Өтуде", ru: "Проходит" },
  completed: { kk: "Аяқталған", ru: "Завершено" },
  cancelled: { kk: "Тоқтатылған", ru: "Отменено" },
};

const STATUS_COLORS: Record<EventStatus, string> = {
  upcoming: "bg-blue-100 text-blue-800",
  ongoing: "bg-emerald-100 text-emerald-800",
  completed: "bg-gray-200 text-gray-700",
  cancelled: "bg-red-100 text-red-800",
};

const TYPE_LABELS: Record<EventType, { kk: string; ru: string }> = {
  concert: { kk: "Концерт", ru: "Концерт" },
  exhibition: { kk: "Көрме", ru: "Выставка" },
  workshop: { kk: "Шеберхана", ru: "Мастер-класс" },
  festival: { kk: "Фестиваль", ru: "Фестиваль" },
  competition: { kk: "Байқау", ru: "Конкурс" },
  other: { kk: "Басқа", ru: "Другое" },
};

const NEXT_STATUS: Record<EventStatus, EventStatus> = {
  upcoming: "ongoing",
  ongoing: "completed",
  completed: "cancelled",
  cancelled: "upcoming",
};

// Convert ISO string to value suitable for <input type="datetime-local">
function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Convert datetime-local value back to full ISO string
function localInputToIso(v: string): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  return d.toISOString();
}

export default function AdminEventsPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";

  const [statusFilter, setStatusFilter] = useState<"" | EventStatus>("");
  const [typeFilter, setTypeFilter] = useState<"" | EventType>("");
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const [translating, setTranslating] = useState<
    null | "title_to_kk" | "title_to_ru" | "desc_to_kk" | "desc_to_ru"
  >(null);
  const [translateErr, setTranslateErr] = useState<
    Partial<Record<"title_to_kk" | "title_to_ru" | "desc_to_kk" | "desc_to_ru", string>>
  >({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const runTranslate = async (
    key: "title_to_kk" | "title_to_ru" | "desc_to_kk" | "desc_to_ru",
  ) => {
    let text = "";
    let from: "ru" | "kk" = "ru";
    let to: "ru" | "kk" = "kk";
    if (key === "title_to_kk") {
      text = form.title_ru;
      from = "ru";
      to = "kk";
    } else if (key === "title_to_ru") {
      text = form.title_kk;
      from = "kk";
      to = "ru";
    } else if (key === "desc_to_kk") {
      text = form.description_ru;
      from = "ru";
      to = "kk";
    } else {
      text = form.description_kk;
      from = "kk";
      to = "ru";
    }
    if (!text.trim()) {
      setTranslateErr((prev) => ({
        ...prev,
        [key]: locale === "kk" ? "Мәтін бос" : "Пустой текст",
      }));
      return;
    }
    setTranslating(key);
    setTranslateErr((prev) => ({ ...prev, [key]: "" }));
    try {
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
      });
      const body = await r.json();
      if (!r.ok) {
        setTranslateErr((prev) => ({
          ...prev,
          [key]: body.error || (locale === "kk" ? "Қате" : "Ошибка"),
        }));
        return;
      }
      const translated: string = body.data?.translated ?? "";
      setForm((f) => {
        if (key === "title_to_kk") return { ...f, title_kk: translated };
        if (key === "title_to_ru") return { ...f, title_ru: translated };
        if (key === "desc_to_kk") return { ...f, description_kk: translated };
        return { ...f, description_ru: translated };
      });
    } catch {
      setTranslateErr((prev) => ({
        ...prev,
        [key]: locale === "kk" ? "Желі қатесі" : "Сетевая ошибка",
      }));
    } finally {
      setTranslating(null);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    setUnauthorized(false);
    try {
      const qs = new URLSearchParams();
      if (statusFilter) qs.set("status", statusFilter);
      if (typeFilter) qs.set("type", typeFilter);
      const url = `/api/admin/events${qs.toString() ? `?${qs.toString()}` : ""}`;
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
      const list = (body.data?.items ?? []) as EventItem[];
      setItems(list);
    } catch {
      setErr(locale === "kk" ? "Желі қатесі" : "Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, locale]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErr("");
    setDrawerOpen(true);
  };

  const fillFormFromItem = (it: EventItem): FormState => ({
    title_kk: it.title_kk,
    title_ru: it.title_ru,
    description_kk: it.description_kk || "",
    description_ru: it.description_ru || "",
    image_url: it.image_url || "",
    event_type: it.event_type,
    start_date: isoToLocalInput(it.start_date),
    end_date: isoToLocalInput(it.end_date),
    location: it.location || "",
    status: it.status,
  });

  const openEdit = async (row: EventItem) => {
    setFormErr("");
    setDrawerOpen(true);
    setEditing(row);
    setForm(fillFormFromItem(row));
    try {
      const r = await fetch(`/api/events/${row.id}`);
      if (r.ok) {
        const body = await r.json();
        const fresh = body.data as EventItem;
        setEditing(fresh);
        setForm(fillFormFromItem(fresh));
      }
    } catch {
      // keep list row
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
    if (!form.start_date) {
      setFormErr(locale === "kk" ? "Басталу уақытын көрсетіңіз" : "Укажите дату начала");
      return;
    }
    setSaving(true);
    setFormErr("");
    const startIso = localInputToIso(form.start_date);
    const endIso = form.end_date ? localInputToIso(form.end_date) : "";
    const payload = {
      title_kk: form.title_kk,
      title_ru: form.title_ru,
      description_kk: form.description_kk,
      description_ru: form.description_ru,
      image_url: form.image_url || "",
      event_type: form.event_type,
      start_date: startIso,
      end_date: endIso || undefined,
      location: form.location || undefined,
      status: form.status,
    };
    try {
      const url = editing ? `/api/events/${editing.id}` : `/api/events`;
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
      const r = await fetch(`/api/events/${editing.id}`, { method: "DELETE" });
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

  const cycleStatus = async (row: EventItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = NEXT_STATUS[row.status];
    try {
      const r = await fetch(`/api/events/${row.id}`, {
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

  const formatStart = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString(locale === "kk" ? "kk-KZ" : "ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "kk" ? "Іс-шаралар" : "Мероприятия"}
        </h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          {locale === "kk" ? "Жаңа" : "Новое"}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterPill active={statusFilter === ""} onClick={() => setStatusFilter("")}>
          {locale === "kk" ? "Барлығы" : "Все"}
        </FilterPill>
        {STATUSES.map((s) => (
          <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
            {STATUS_LABELS[s][locale]}
          </FilterPill>
        ))}
        <div className="ml-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "" | EventType)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="">{locale === "kk" ? "Барлық түрлер" : "Все типы"}</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t][locale]}
              </option>
            ))}
          </select>
        </div>
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
              <Th>{locale === "kk" ? "Атауы (RU)" : "Название (RU)"}</Th>
              <Th>{locale === "kk" ? "Түрі" : "Тип"}</Th>
              <Th>{locale === "kk" ? "Басталуы" : "Начало"}</Th>
              <Th>{locale === "kk" ? "Орны" : "Место"}</Th>
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
                  <td className="max-w-md truncate px-4 py-3 font-medium text-gray-900">
                    {it.title_ru}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {TYPE_LABELS[it.event_type]?.[locale] ?? it.event_type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                    {formatStart(it.start_date)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{it.location || "—"}</td>
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
                    ? "Іс-шараны өңдеу"
                    : "Редактировать мероприятие"
                  : locale === "kk"
                  ? "Жаңа іс-шара"
                  : "Новое мероприятие"}
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
                <Field label={locale === "kk" ? "Атауы (KK)" : "Название (KK)"}>
                  <div className="flex items-center gap-2">
                    <input
                      required
                      value={form.title_kk}
                      onChange={(e) => setForm({ ...form, title_kk: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => runTranslate("title_to_kk")}
                      disabled={translating === "title_to_kk"}
                      title={locale === "kk" ? "RU → KK аудару" : "Перевести RU → KK"}
                      className="shrink-0 rounded-lg bg-accent/10 px-2 py-2 text-xs font-semibold text-primary-dark hover:bg-accent/20 disabled:opacity-60"
                    >
                      {translating === "title_to_kk" ? "…" : "→ KK"}
                    </button>
                  </div>
                  {translateErr.title_to_kk && (
                    <div className="mt-1 text-xs text-red-600">{translateErr.title_to_kk}</div>
                  )}
                </Field>
                <Field label={locale === "kk" ? "Атауы (RU)" : "Название (RU)"}>
                  <div className="flex items-center gap-2">
                    <input
                      required
                      value={form.title_ru}
                      onChange={(e) => setForm({ ...form, title_ru: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => runTranslate("title_to_ru")}
                      disabled={translating === "title_to_ru"}
                      title={locale === "kk" ? "KK → RU аудару" : "Перевести KK → RU"}
                      className="shrink-0 rounded-lg bg-accent/10 px-2 py-2 text-xs font-semibold text-primary-dark hover:bg-accent/20 disabled:opacity-60"
                    >
                      {translating === "title_to_ru" ? "…" : "→ RU"}
                    </button>
                  </div>
                  {translateErr.title_to_ru && (
                    <div className="mt-1 text-xs text-red-600">{translateErr.title_to_ru}</div>
                  )}
                </Field>
              </div>

              <Field label={locale === "kk" ? "Сипаттамасы (KK)" : "Описание (KK)"}>
                <div className="flex items-start gap-2">
                  <textarea
                    rows={5}
                    value={form.description_kk}
                    onChange={(e) => setForm({ ...form, description_kk: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => runTranslate("desc_to_kk")}
                    disabled={translating === "desc_to_kk"}
                    title={locale === "kk" ? "RU → KK аудару" : "Перевести RU → KK"}
                    className="shrink-0 rounded-lg bg-accent/10 px-2 py-2 text-xs font-semibold text-primary-dark hover:bg-accent/20 disabled:opacity-60"
                  >
                    {translating === "desc_to_kk" ? "…" : "→ KK"}
                  </button>
                </div>
                {translateErr.desc_to_kk && (
                  <div className="mt-1 text-xs text-red-600">{translateErr.desc_to_kk}</div>
                )}
              </Field>
              <Field label={locale === "kk" ? "Сипаттамасы (RU)" : "Описание (RU)"}>
                <div className="flex items-start gap-2">
                  <textarea
                    rows={5}
                    value={form.description_ru}
                    onChange={(e) => setForm({ ...form, description_ru: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => runTranslate("desc_to_ru")}
                    disabled={translating === "desc_to_ru"}
                    title={locale === "kk" ? "KK → RU аудару" : "Перевести KK → RU"}
                    className="shrink-0 rounded-lg bg-accent/10 px-2 py-2 text-xs font-semibold text-primary-dark hover:bg-accent/20 disabled:opacity-60"
                  >
                    {translating === "desc_to_ru" ? "…" : "→ RU"}
                  </button>
                </div>
                {translateErr.desc_to_ru && (
                  <div className="mt-1 text-xs text-red-600">{translateErr.desc_to_ru}</div>
                )}
              </Field>

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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={locale === "kk" ? "Түрі" : "Тип"}>
                  <select
                    value={form.event_type}
                    onChange={(e) =>
                      setForm({ ...form, event_type: e.target.value as EventType })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {TYPE_LABELS[t][locale]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={locale === "kk" ? "Мәртебе" : "Статус"}>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as EventStatus })
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
                <Field label={locale === "kk" ? "Басталуы" : "Дата начала"}>
                  <input
                    required
                    type="datetime-local"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </Field>
                <Field label={locale === "kk" ? "Аяқталуы" : "Дата окончания"}>
                  <input
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </Field>
                <Field label={locale === "kk" ? "Орны" : "Место"}>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
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
