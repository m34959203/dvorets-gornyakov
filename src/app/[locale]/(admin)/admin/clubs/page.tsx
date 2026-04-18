"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

type Direction = "vocal" | "dance" | "art" | "theater" | "sport" | "general";

const DIRECTIONS: Direction[] = ["vocal", "dance", "art", "theater", "sport", "general"];

const DIRECTION_LABELS: Record<Direction, { kk: string; ru: string }> = {
  vocal: { kk: "Вокал", ru: "Вокал" },
  dance: { kk: "Би", ru: "Танцы" },
  art: { kk: "Өнер", ru: "ИЗО" },
  theater: { kk: "Театр", ru: "Театр" },
  sport: { kk: "Спорт", ru: "Спорт" },
  general: { kk: "Жалпы", ru: "Общее" },
};

interface ScheduleItem {
  day: string;
  time: string;
}

interface Club {
  id: string;
  name_kk: string;
  name_ru: string;
  description_kk: string;
  description_ru: string;
  image_url: string | null;
  direction: string;
  age_group: string;
  instructor_name: string;
  schedule: ScheduleItem[] | string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface FormState {
  name_kk: string;
  name_ru: string;
  description_kk: string;
  description_ru: string;
  image_url: string;
  direction: Direction;
  age_group: string;
  instructor_name: string;
  scheduleText: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  name_kk: "",
  name_ru: "",
  description_kk: "",
  description_ru: "",
  image_url: "",
  direction: "general",
  age_group: "",
  instructor_name: "",
  scheduleText: "[]",
  is_active: true,
};

function scheduleToText(schedule: Club["schedule"]): string {
  if (!schedule) return "[]";
  if (typeof schedule === "string") {
    try {
      const parsed = JSON.parse(schedule);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return schedule;
    }
  }
  return JSON.stringify(schedule, null, 2);
}

export default function AdminClubsPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";

  const [items, setItems] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [directionFilter, setDirectionFilter] = useState<"all" | Direction>("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Club | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [scheduleError, setScheduleError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [translating, setTranslating] = useState<
    null | "name_to_kk" | "name_to_ru" | "desc_to_kk" | "desc_to_ru"
  >(null);
  const [translateErr, setTranslateErr] = useState<
    Partial<Record<"name_to_kk" | "name_to_ru" | "desc_to_kk" | "desc_to_ru", string>>
  >({});

  const runTranslate = async (
    key: "name_to_kk" | "name_to_ru" | "desc_to_kk" | "desc_to_ru",
  ) => {
    let text = "";
    let from: "ru" | "kk" = "ru";
    let to: "ru" | "kk" = "kk";
    if (key === "name_to_kk") {
      text = form.name_ru;
      from = "ru";
      to = "kk";
    } else if (key === "name_to_ru") {
      text = form.name_kk;
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
        if (key === "name_to_kk") return { ...f, name_kk: translated };
        if (key === "name_to_ru") return { ...f, name_ru: translated };
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
      if (directionFilter && directionFilter !== "all") qs.set("direction", directionFilter);
      if (activeFilter) qs.set("active", activeFilter);
      const r = await fetch(`/api/admin/clubs${qs.toString() ? `?${qs}` : ""}`);
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
  }, [directionFilter, activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setScheduleError("");
    setFormErr("");
    setDrawerOpen(true);
  };

  const openEdit = (c: Club) => {
    setEditing(c);
    const dir = (DIRECTIONS as string[]).includes(c.direction) ? (c.direction as Direction) : "general";
    setForm({
      name_kk: c.name_kk ?? "",
      name_ru: c.name_ru ?? "",
      description_kk: c.description_kk ?? "",
      description_ru: c.description_ru ?? "",
      image_url: c.image_url ?? "",
      direction: dir,
      age_group: c.age_group ?? "",
      instructor_name: c.instructor_name ?? "",
      scheduleText: scheduleToText(c.schedule),
      is_active: c.is_active,
    });
    setScheduleError("");
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
    setScheduleError("");

    let schedule: ScheduleItem[] = [];
    const trimmed = form.scheduleText.trim();
    if (trimmed) {
      try {
        const parsed = JSON.parse(trimmed);
        if (!Array.isArray(parsed)) throw new Error("not array");
        for (const item of parsed) {
          if (!item || typeof item.day !== "string" || typeof item.time !== "string") {
            throw new Error("bad shape");
          }
        }
        schedule = parsed;
      } catch {
        setScheduleError(locale === "kk" ? "Қате JSON" : "Invalid JSON");
        return;
      }
    }

    const payload = {
      name_kk: form.name_kk,
      name_ru: form.name_ru,
      description_kk: form.description_kk,
      description_ru: form.description_ru,
      image_url: form.image_url || "",
      direction: form.direction,
      age_group: form.age_group,
      instructor_name: form.instructor_name,
      schedule,
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      const url = editing ? `/api/clubs/${editing.id}` : "/api/clubs";
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

  const onDelete = async () => {
    if (!editing) return;
    const msg = locale === "kk" ? "Шынымен жоясыз ба?" : "Удалить клуб?";
    if (!confirm(msg)) return;
    try {
      const r = await fetch(`/api/clubs/${editing.id}`, { method: "DELETE" });
      const body = await r.json();
      if (!r.ok) {
        alert(body.error || "Ошибка");
        return;
      }
      closeDrawer();
      load();
    } catch {
      alert("Сетевая ошибка");
    }
  };

  const onToggleActive = async (c: Club, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const r = await fetch(`/api/clubs/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !c.is_active }),
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
          {locale === "kk" ? "Үйірмелер" : "Клубы"}
        </h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          {locale === "kk" ? "Жаңа" : "Создать"}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveFilter("")}
          className={"rounded-full px-4 py-1.5 text-sm font-medium " + (activeFilter === "" ? "bg-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200")}
        >
          {locale === "kk" ? "Барлығы" : "Все"}
        </button>
        <button
          onClick={() => setActiveFilter("true")}
          className={"rounded-full px-4 py-1.5 text-sm font-medium " + (activeFilter === "true" ? "bg-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200")}
        >
          {locale === "kk" ? "Белсенді" : "Активные"}
        </button>
        <button
          onClick={() => setActiveFilter("false")}
          className={"rounded-full px-4 py-1.5 text-sm font-medium " + (activeFilter === "false" ? "bg-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200")}
        >
          {locale === "kk" ? "Өшірілген" : "Неактивные"}
        </button>

        <div className="ml-2">
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value as "all" | Direction)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="all">{locale === "kk" ? "Бағыт: барлығы" : "Направление: все"}</option>
            {DIRECTIONS.map((d) => (
              <option key={d} value={d}>{DIRECTION_LABELS[d][locale]}</option>
            ))}
          </select>
        </div>
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>{locale === "kk" ? "Сурет" : "Фото"}</Th>
              <Th>{locale === "kk" ? "Атауы" : "Название"}</Th>
              <Th>{locale === "kk" ? "Бағыт" : "Направление"}</Th>
              <Th>{locale === "kk" ? "Жас" : "Возраст"}</Th>
              <Th>{locale === "kk" ? "Жетекші" : "Руководитель"}</Th>
              <Th>{locale === "kk" ? "Күй" : "Статус"}</Th>
              <Th>{locale === "kk" ? "Әрекеттер" : "Действия"}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">—</td></tr>
            ) : (
              items.map((c) => {
                const dirKey = (DIRECTIONS as string[]).includes(c.direction) ? (c.direction as Direction) : null;
                return (
                  <tr
                    key={c.id}
                    onClick={() => openEdit(c)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      {c.image_url ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                          <Image src={c.image_url} alt="" fill className="object-cover" sizes="48px" unoptimized />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{c.name_ru}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {dirKey ? DIRECTION_LABELS[dirKey][locale] : c.direction}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{c.age_group}</td>
                    <td className="px-4 py-3 text-gray-700">{c.instructor_name}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => onToggleActive(c, e)}
                        className={
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium " +
                          (c.is_active
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300")
                        }
                      >
                        {c.is_active
                          ? (locale === "kk" ? "Белсенді" : "Активен")
                          : (locale === "kk" ? "Өшірілген" : "Неактивен")}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(c); }}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {locale === "kk" ? "Ашу" : "Открыть"}
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
            className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editing
                  ? (locale === "kk" ? "Үйірмені өзгерту" : "Редактировать клуб")
                  : (locale === "kk" ? "Жаңа үйірме" : "Новый клуб")}
              </h2>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            {formErr && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formErr}</div>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={locale === "kk" ? "Атауы (KK)" : "Название (KK)"}>
                <div className="flex items-center gap-2">
                  <input
                    value={form.name_kk}
                    onChange={(e) => setForm({ ...form, name_kk: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => runTranslate("name_to_kk")}
                    disabled={translating === "name_to_kk"}
                    title={locale === "kk" ? "RU → KK аудару" : "Перевести RU → KK"}
                    className="shrink-0 rounded-lg bg-accent/10 px-2 py-2 text-xs font-semibold text-primary-dark hover:bg-accent/20 disabled:opacity-60"
                  >
                    {translating === "name_to_kk" ? "…" : "→ KK"}
                  </button>
                </div>
                {translateErr.name_to_kk && (
                  <div className="mt-1 text-xs text-red-600">{translateErr.name_to_kk}</div>
                )}
              </Field>
              <Field label={locale === "kk" ? "Атауы (RU)" : "Название (RU)"}>
                <div className="flex items-center gap-2">
                  <input
                    value={form.name_ru}
                    onChange={(e) => setForm({ ...form, name_ru: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => runTranslate("name_to_ru")}
                    disabled={translating === "name_to_ru"}
                    title={locale === "kk" ? "KK → RU аудару" : "Перевести KK → RU"}
                    className="shrink-0 rounded-lg bg-accent/10 px-2 py-2 text-xs font-semibold text-primary-dark hover:bg-accent/20 disabled:opacity-60"
                  >
                    {translating === "name_to_ru" ? "…" : "→ RU"}
                  </button>
                </div>
                {translateErr.name_to_ru && (
                  <div className="mt-1 text-xs text-red-600">{translateErr.name_to_ru}</div>
                )}
              </Field>

              <Field label={locale === "kk" ? "Сипаттама (KK)" : "Описание (KK)"} className="sm:col-span-2">
                <div className="flex items-start gap-2">
                  <textarea
                    rows={3}
                    value={form.description_kk}
                    onChange={(e) => setForm({ ...form, description_kk: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
              <Field label={locale === "kk" ? "Сипаттама (RU)" : "Описание (RU)"} className="sm:col-span-2">
                <div className="flex items-start gap-2">
                  <textarea
                    rows={3}
                    value={form.description_ru}
                    onChange={(e) => setForm({ ...form, description_ru: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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

              <Field label={locale === "kk" ? "Сурет" : "Изображение"} className="sm:col-span-2">
                <div className="flex items-center gap-3">
                  {form.image_url ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                      <Image src={form.image_url} alt="" fill className="object-cover" sizes="80px" unoptimized />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-gray-100" />
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

              <Field label={locale === "kk" ? "Бағыт" : "Направление"}>
                <select
                  value={form.direction}
                  onChange={(e) => setForm({ ...form, direction: e.target.value as Direction })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {DIRECTIONS.map((d) => (
                    <option key={d} value={d}>{DIRECTION_LABELS[d][locale]}</option>
                  ))}
                </select>
              </Field>

              <Field label={locale === "kk" ? "Жас тобы" : "Возрастная группа"}>
                <input
                  value={form.age_group}
                  onChange={(e) => setForm({ ...form, age_group: e.target.value })}
                  placeholder="7-18"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>

              <Field label={locale === "kk" ? "Жетекші" : "Руководитель"} className="sm:col-span-2">
                <input
                  value={form.instructor_name}
                  onChange={(e) => setForm({ ...form, instructor_name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>

              <Field label={locale === "kk" ? "Кесте (JSON)" : "Расписание (JSON)"} className="sm:col-span-2">
                <textarea
                  rows={4}
                  value={form.scheduleText}
                  onChange={(e) => setForm({ ...form, scheduleText: e.target.value })}
                  placeholder='[{"day":"Пн","time":"18:00"}]'
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
                />
                {scheduleError && <div className="mt-1 text-xs text-red-600">{scheduleError}</div>}
              </Field>

              <Field label={locale === "kk" ? "Белсенді" : "Активен"} className="sm:col-span-2">
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
                    onClick={onDelete}
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
