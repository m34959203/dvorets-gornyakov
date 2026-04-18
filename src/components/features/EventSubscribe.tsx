"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
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
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitText = locale === "kk" ? "Жазылу" : "Подписаться";
  const errorText =
    locale === "kk" ? "Қате орын алды. Қайталап көріңіз." : "Произошла ошибка. Попробуйте ещё раз.";
  const tooManyText =
    locale === "kk"
      ? "Сұраныстар өте көп. Кейінірек қайталаңыз."
      : "Слишком много запросов. Попробуйте позже.";

  const reset = () => {
    setEmail("");
    setSuccess(false);
    setError(null);
    setSubmitting(false);
  };

  const close = () => {
    setIsOpen(false);
    setTimeout(reset, 200);
  };

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
        setError(body?.error || errorText);
      }
    } catch {
      setError(errorText);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} variant="primary">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {labels.subscribe}
      </Button>

      <Modal isOpen={isOpen} onClose={close} title={labels.subscribe} size="sm">
        {success ? (
          <div className="space-y-4">
            <p className="text-green-600 font-medium">{labels.subscribeSuccess}</p>
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={close}>
                {locale === "kk" ? "Жабу" : "Закрыть"}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-4">
            <Input
              id="event_subscribe_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={close} disabled={submitting}>
                {locale === "kk" ? "Болдырмау" : "Отмена"}
              </Button>
              <Button type="submit" loading={submitting} disabled={submitting}>
                {submitText}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
