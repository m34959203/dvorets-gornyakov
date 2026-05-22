"use client";

import { useState, FormEvent } from "react";
import DgIcon from "@/components/layout/DgIcon";
import type { Locale } from "@/lib/i18n";

interface ContactFormProps {
  locale: Locale;
  messages: Record<string, string>;
}

export default function ContactForm({ locale, messages: t }: ContactFormProps) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // In production, this would send to an API endpoint
    // For now we simulate a successful submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStatus("success");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  if (status === "success") {
    return (
      <div
        style={{
          border: "1px solid var(--dg-hair-2)",
          borderRadius: "var(--dg-radius)",
          padding: "40px 32px",
          textAlign: "center",
          color: "var(--dg-text)",
        }}
      >
        <div style={{ color: "var(--dg-accent)", marginBottom: 16 }}>
          <DgIcon name="mail" size={40} />
        </div>
        <p style={{ fontWeight: 500, letterSpacing: "0.04em" }}>{t.sendSuccess}</p>
        <button
          onClick={() => setStatus("idle")}
          className="dg-btn dg-btn-ghost"
          style={{ marginTop: 20, display: "inline-flex" }}
        >
          {locale === "kk" ? "Жаңа хабарлама" : "Новое сообщение"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="dg-form">
      {/* Name */}
      <div className="dg-field">
        <label className="dg-label" htmlFor="contact_name">
          {t.name}
        </label>
        <input
          id="contact_name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          minLength={2}
          placeholder={locale === "kk" ? "Аты-жөніңіз" : "Ваше имя"}
        />
      </div>

      {/* Email */}
      <div className="dg-field">
        <label className="dg-label" htmlFor="contact_email">
          Email
        </label>
        <input
          id="contact_email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          placeholder={locale === "kk" ? "email@mысал.kz" : "email@example.kz"}
        />
      </div>

      {/* Subject */}
      <div className="dg-field">
        <label className="dg-label" htmlFor="contact_subject">
          {t.subject}
        </label>
        <input
          id="contact_subject"
          type="text"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          required
          minLength={2}
          placeholder={locale === "kk" ? "Хабарламаның тақырыбы" : "Тема обращения"}
        />
      </div>

      {/* Message */}
      <div className="dg-field">
        <label className="dg-label" htmlFor="contact_message">
          {t.message}
        </label>
        <textarea
          id="contact_message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          minLength={10}
          rows={5}
          placeholder={
            locale === "kk"
              ? "Хабарламаңызды жазыңыз..."
              : "Напишите ваше сообщение..."
          }
        />
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          className="dg-btn"
          disabled={status === "loading"}
          style={{ width: "100%", justifyContent: "center" }}
        >
          {status === "loading" ? (
            locale === "kk" ? "Жіберілуде…" : "Отправка…"
          ) : (
            <>
              {locale === "kk" ? "Жіберу" : "Отправить"}
              <DgIcon name="arrow" size={16} />
            </>
          )}
        </button>

        {status === "error" && (
          <p
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "#e07a4a",
              letterSpacing: "0.08em",
            }}
          >
            {t.sendError}
          </p>
        )}
      </div>
    </form>
  );
}
