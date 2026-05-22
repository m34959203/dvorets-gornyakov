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
    <form onSubmit={onSubmit} className="dg-form">
      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: -9999, height: 0, width: 0, opacity: 0 }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 18,
        }}
        className="dg-form-grid"
      >
        {/* Hall select — full width */}
        <DgField label={labels.hall} style={{ gridColumn: "1 / -1" }}>
          <select name="hall_id" defaultValue={defaultHallId ?? halls[0]?.id} required>
            {halls.map((h) => (
              <option key={h.id} value={h.id}>
                {getLocalizedField(h as unknown as Record<string, unknown>, "name", locale)}
              </option>
            ))}
          </select>
        </DgField>

        <DgField label={labels.name}>
          <input name="name" required minLength={2} maxLength={255} />
        </DgField>

        <DgField label={labels.phone}>
          <input name="phone" required placeholder="+7 701 000 00 00" />
        </DgField>

        <DgField label={labels.email}>
          <input name="email" type="email" required />
        </DgField>

        <DgField label={labels.eventType}>
          <select name="event_type" required>
            {Object.entries(labels.eventTypes).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </DgField>

        <DgField label={labels.date}>
          <input name="event_date" type="date" required />
        </DgField>

        <DgField label={labels.guests}>
          <input name="guests" type="number" min={1} max={2000} required defaultValue={50} />
        </DgField>

        <DgField label={labels.timeFrom}>
          <input name="time_from" type="time" required defaultValue="18:00" />
        </DgField>

        <DgField label={labels.timeTo}>
          <input name="time_to" type="time" required defaultValue="21:00" />
        </DgField>
      </div>

      {/* Equipment checkboxes */}
      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
        <legend
          style={{
            fontSize: 10.5,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--dg-text-2)",
            marginBottom: 12,
          }}
        >
          {labels.equipment}
        </legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {EQ.map((tag) => (
            <label
              key={tag}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "8px 14px",
                border: "1px solid var(--dg-hair-2)",
                borderRadius: 2,
                color: "var(--dg-text-2)",
                transition: "border-color .15s, color .15s",
              }}
              className="dg-eq-tag"
            >
              <input type="checkbox" name={`eq_${tag}`} style={{ accentColor: "var(--dg-accent)" }} />
              {labels.equipmentOptions[tag]}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Message */}
      <DgField label={labels.message}>
        <textarea name="message" rows={3} maxLength={2000} />
      </DgField>

      {/* Submit row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <button type="submit" disabled={status === "sending"} className="dg-btn">
          {status === "sending" ? labels.submitting : labels.submit}
        </button>
        {status === "ok" && (
          <p
            style={{
              fontSize: 13,
              color: "var(--dg-accent)",
              margin: 0,
              letterSpacing: "0.04em",
            }}
          >
            {labels.success}
          </p>
        )}
        {status === "err" && (
          <p
            style={{
              fontSize: 13,
              color: "#f87171",
              margin: 0,
            }}
          >
            {errMsg}
          </p>
        )}
      </div>
    </form>
  );
}

function DgField({
  label,
  style,
  children,
}: {
  label: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div className="dg-field" style={style}>
      <span className="dg-label">{label}</span>
      {children}
    </div>
  );
}
