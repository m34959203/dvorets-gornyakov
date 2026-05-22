"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

interface EventSubscribeProps {
  eventId: string;
  locale: Locale;
  labels: {
    subscribe: string;
    subscribeSuccess: string;
  };
}

export default function EventSubscribe({ eventId, locale, labels }: EventSubscribeProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitText = locale === "kk" ? "Жазылу" : "Подписаться";
  const errorText =
    locale === "kk"
      ? "Қате орын алды. Қайталап көріңіз."
      : "Произошла ошибка. Попробуйте ещё раз.";
  const tooManyText =
    locale === "kk"
      ? "Сұраныстар өте көп. Кейінірек қайталаңыз."
      : "Слишком много запросов. Попробуйте позже.";
  const emailLabel = locale === "kk" ? "Электрондық пошта" : "Электронная почта";

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess(true);
      } else if (res.status === 429) {
        setError(tooManyText);
      } else {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string })?.error || errorText);
      }
    } catch {
      setError(errorText);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <p style={{ color: "var(--dg-accent)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
        {labels.subscribeSuccess}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="dg-form">
      <div className="dg-field">
        <label className="dg-label" htmlFor="event_subscribe_email">
          {emailLabel}
        </label>
        <input
          id="event_subscribe_email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          autoFocus
        />
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>{error}</p>
      )}

      <button
        type="submit"
        className="dg-btn"
        disabled={submitting}
      >
        {submitting
          ? locale === "kk"
            ? "Жіберілуде…"
            : "Отправка…"
          : submitText}
      </button>
    </form>
  );
}
