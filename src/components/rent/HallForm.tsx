"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Hall } from "@/lib/rent/types";
import type { Locale } from "@/lib/i18n";

interface Props {
  locale: Locale;
  initial?: Hall | null;
}

export default function HallForm({ locale, initial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>("");

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [nameKk, setNameKk] = useState(initial?.name_kk ?? "");
  const [nameRu, setNameRu] = useState(initial?.name_ru ?? "");
  const [descKk, setDescKk] = useState(initial?.description_kk ?? "");
  const [descRu, setDescRu] = useState(initial?.description_ru ?? "");
  const [capacity, setCapacity] = useState(initial?.capacity ?? 0);
  const [hourly, setHourly] = useState(initial?.hourly_price ?? 0);
  const [eventFrom, setEventFrom] = useState(initial?.event_price_from ?? 0);
  const [eqKk, setEqKk] = useState((initial?.equipment_kk ?? []).join("\n"));
  const [eqRu, setEqRu] = useState((initial?.equipment_ru ?? []).join("\n"));
  const [photosText, setPhotosText] = useState(
    (initial?.photos ?? []).map((p) => p.url).join("\n")
  );
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    const payload = {
      slug,
      name_kk: nameKk,
      name_ru: nameRu,
      description_kk: descKk,
      description_ru: descRu,
      capacity: Number(capacity),
      equipment_kk: eqKk.split("\n").map((s) => s.trim()).filter(Boolean),
      equipment_ru: eqRu.split("\n").map((s) => s.trim()).filter(Boolean),
      hourly_price: Number(hourly),
      event_price_from: Number(eventFrom),
      photos: photosText
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean)
        .map((url) => ({ url, alt_ru: "", alt_kk: "" })),
      layout_url: null,
      is_active: isActive,
      sort_order: Number(sortOrder),
    };

    const url = initial ? `/api/admin/rent/halls/${initial.id}` : `/api/admin/rent/halls`;
    const method = initial ? "PUT" : "POST";
    try {
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await r.json();
      if (!r.ok) {
        setErr(body.error || "Ошибка сохранения");
        setSaving(false);
        return;
      }
      router.push(`/${locale}/admin/rent/halls`);
      router.refresh();
    } catch {
      setErr("Сетевая ошибка");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
      {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Slug">
          <input required pattern="^[a-z0-9-]+$" value={slug} onChange={(e) => setSlug(e.target.value)}
                 className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        </Field>
        <Field label="Sort order">
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))}
                 className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        </Field>
        <Field label="Name (RU)">
          <input required value={nameRu} onChange={(e) => setNameRu(e.target.value)}
                 className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        </Field>
        <Field label="Name (KK)">
          <input required value={nameKk} onChange={(e) => setNameKk(e.target.value)}
                 className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        </Field>
        <Field label="Capacity">
          <input type="number" min={0} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))}
                 className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        </Field>
        <Field label="Hourly price (₸)">
          <input type="number" min={0} value={hourly} onChange={(e) => setHourly(Number(e.target.value))}
                 className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        </Field>
        <Field label="Event price from (₸)" className="sm:col-span-2">
          <input type="number" min={0} value={eventFrom} onChange={(e) => setEventFrom(Number(e.target.value))}
                 className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        </Field>
        <Field label="Description (RU)" className="sm:col-span-2">
          <textarea rows={4} value={descRu} onChange={(e) => setDescRu(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        </Field>
        <Field label="Description (KK)" className="sm:col-span-2">
          <textarea rows={4} value={descKk} onChange={(e) => setDescKk(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        </Field>
        <Field label="Equipment RU (каждый пункт с новой строки)">
          <textarea rows={5} value={eqRu} onChange={(e) => setEqRu(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm" />
        </Field>
        <Field label="Equipment KK (каждый пункт с новой строки)">
          <textarea rows={5} value={eqKk} onChange={(e) => setEqKk(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm" />
        </Field>
        <Field label="Photo URLs (одна на строку; первый = cover)" className="sm:col-span-2">
          <textarea rows={4} value={photosText} onChange={(e) => setPhotosText(e.target.value)}
                    placeholder="/hero/hall-grand-1.jpg"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm" />
        </Field>
        <Field label="Активен">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span className="text-sm">{isActive ? "Да" : "Нет"}</span>
          </label>
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
          {saving ? "Сохранение…" : initial ? "Сохранить" : "Создать"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={"block " + (className ?? "")}>
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
