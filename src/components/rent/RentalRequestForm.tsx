"use client";

import { useState } from "react";
import type { Hall, EquipmentTag } from "@/lib/rent/types";
import type { Locale } from "@/lib/i18n";
import { getLocalizedField } from "@/lib/i18n";

interface Labels {
  title: string;
  hall: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  guests: string;
  eventType: string;
  equipment: string;
  message: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  eventTypes: Record<string, string>;
  equipmentOptions: Record<EquipmentTag, string>;
}

interface Props {
  halls: Hall[];
  locale: Locale;
  labels: Labels;
  defaultHallId?: string;
}

const EQ: EquipmentTag[] = ["mic", "projector", "lights", "streaming", "catering"];

export default function RentalRequestForm({ halls, locale, labels, defaultHallId }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      hall_id: fd.get("hall_id"),
      name: fd.get("name"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      event_type: fd.get("event_type"),
      event_date: fd.get("event_date"),
      time_from: fd.get("time_from"),
      time_to: fd.get("time_to"),
      guests: Number(fd.get("guests")),
      equipment: EQ.filter((k) => fd.get(`eq_${k}`) === "on"),
      message: fd.get("message") || "",
      website: fd.get("website") || "",
    };

    setStatus("sending");
    setErrMsg("");
    try {
      const r = await fetch("/api/rent/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await r.json();
      if (!r.ok) {
        setStatus("err");
        setErrMsg(body.error || labels.error);
        return;
      }
      setStatus("ok");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("err");
      setErrMsg(labels.error);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8"
    >
      <h3 className="text-2xl font-bold text-gray-900">{labels.title}</h3>

      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off"
             className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={labels.hall} className="sm:col-span-2">
          <select name="hall_id" defaultValue={defaultHallId ?? halls[0]?.id} required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5">
            {halls.map((h) => (
              <option key={h.id} value={h.id}>{getLocalizedField(h, "name", locale)}</option>
            ))}
          </select>
        </Field>
        <Field label={labels.name}>
          <input name="name" required minLength={2} maxLength={255}
                 className="w-full rounded-lg border border-gray-300 px-3 py-2.5" />
        </Field>
        <Field label={labels.phone}>
          <input name="phone" required placeholder="+7 701 000 00 00"
                 className="w-full rounded-lg border border-gray-300 px-3 py-2.5" />
        </Field>
        <Field label={labels.email}>
          <input name="email" type="email" required
                 className="w-full rounded-lg border border-gray-300 px-3 py-2.5" />
        </Field>
        <Field label={labels.eventType}>
          <select name="event_type" required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5">
            {Object.entries(labels.eventTypes).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label={labels.date}>
          <input name="event_date" type="date" required
                 className="w-full rounded-lg border border-gray-300 px-3 py-2.5" />
        </Field>
        <Field label={labels.guests}>
          <input name="guests" type="number" min={1} max={2000} required defaultValue={50}
                 className="w-full rounded-lg border border-gray-300 px-3 py-2.5" />
        </Field>
        <Field label={labels.timeFrom}>
          <input name="time_from" type="time" required defaultValue="18:00"
                 className="w-full rounded-lg border border-gray-300 px-3 py-2.5" />
        </Field>
        <Field label={labels.timeTo}>
          <input name="time_to" type="time" required defaultValue="21:00"
                 className="w-full rounded-lg border border-gray-300 px-3 py-2.5" />
        </Field>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-gray-900">{labels.equipment}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {EQ.map((tag) => (
            <label key={tag}
                   className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm text-gray-700 transition has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary">
              <input type="checkbox" name={`eq_${tag}`} className="sr-only" />
              {labels.equipmentOptions[tag]}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label={labels.message} className="mt-6">
        <textarea name="message" rows={3} maxLength={2000}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5" />
      </Field>

      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={status === "sending"}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60">
          {status === "sending" ? labels.submitting : labels.submit}
        </button>
        {status === "ok" && <p className="text-sm font-medium text-emerald-700">{labels.success}</p>}
        {status === "err" && <p className="text-sm font-medium text-red-700">{errMsg}</p>}
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
