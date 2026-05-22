"use client";

import { useState, FormEvent } from "react";
import type { Locale } from "@/lib/i18n";

interface EnrollmentFormProps {
  clubId: string;
  locale: Locale;
  messages: Record<string, string>;
}

export default function EnrollmentForm({ clubId, locale, messages: t }: EnrollmentFormProps) {
  const [form, setForm] = useState({
    child_name: "",
    child_age: "",
    parent_name: "",
    phone: "+7 7",
    email: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const response = await fetch("/api/clubs/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: clubId,
          child_name: form.child_name,
          child_age: parseInt(form.child_age, 10),
          parent_name: form.parent_name,
          phone: form.phone,
          email: form.email || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t.enrollError);
      }

      setStatus("success");
      setForm({ child_name: "", child_age: "", parent_name: "", phone: "+7 7", email: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : t.enrollError);
    }
  };

  const formatPhone = (value: string) => {
    // Keep only digits and +
    const digits = value.replace(/[^\d+]/g, "");
    if (digits.length <= 2) return "+7 7";

    let formatted = "+7 7";
    const rest = digits.slice(3);
    if (rest.length > 0) formatted += rest.slice(0, 2);
    if (rest.length > 2) formatted += " " + rest.slice(2, 5);
    if (rest.length > 5) formatted += " " + rest.slice(5, 7);
    if (rest.length > 7) formatted += " " + rest.slice(7, 9);
    return formatted;
  };

  if (status === "success") {
    return (
      <div style={{
        border: "1px solid var(--dg-accent)",
        borderRadius: "var(--dg-radius)",
        padding: "24px",
        textAlign: "center",
      }}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--dg-accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ margin: "0 auto 12px" }}
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p style={{ color: "var(--dg-text)", fontSize: 14, lineHeight: 1.6 }}>{t.enrollSuccess}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="dg-form">
      <div className="dg-field">
        <label className="dg-label" htmlFor="child_name">{t.childName}</label>
        <input
          id="child_name"
          type="text"
          value={form.child_name}
          onChange={(e) => setForm({ ...form, child_name: e.target.value })}
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div className="dg-field">
        <label className="dg-label" htmlFor="child_age">{t.childAge}</label>
        <input
          id="child_age"
          type="number"
          min={1}
          max={99}
          value={form.child_age}
          onChange={(e) => setForm({ ...form, child_age: e.target.value })}
          required
        />
      </div>

      <div className="dg-field">
        <label className="dg-label" htmlFor="parent_name">{t.parentName}</label>
        <input
          id="parent_name"
          type="text"
          value={form.parent_name}
          onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div className="dg-field">
        <label className="dg-label" htmlFor="phone">{t.phone}</label>
        <input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
          placeholder="+7 7XX XXX XX XX"
          required
        />
      </div>

      <div className="dg-field">
        <label className="dg-label" htmlFor="email">
          {locale === "kk" ? "Email (міндетті емес)" : "Email (необязательно)"}
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      {status === "error" && (
        <p style={{
          fontSize: 13,
          color: "var(--dg-accent)",
          border: "1px solid var(--dg-hair)",
          borderRadius: "var(--dg-radius)",
          padding: "10px 14px",
        }}>
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        className="dg-btn"
        disabled={status === "loading"}
        style={{ width: "100%", justifyContent: "center" }}
      >
        {status === "loading"
          ? (locale === "kk" ? "Жіберілуде…" : "Отправка…")
          : t.enroll}
      </button>
    </form>
  );
}
