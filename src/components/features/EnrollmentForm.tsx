"use client";

import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-green-800 font-medium">{t.enrollSuccess}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="child_name"
        label={t.childName}
        value={form.child_name}
        onChange={(e) => setForm({ ...form, child_name: e.target.value })}
        required
        minLength={2}
        maxLength={100}
      />

      <Input
        id="child_age"
        label={t.childAge}
        type="number"
        min={1}
        max={99}
        value={form.child_age}
        onChange={(e) => setForm({ ...form, child_age: e.target.value })}
        required
      />

      <Input
        id="parent_name"
        label={t.parentName}
        value={form.parent_name}
        onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
        required
        minLength={2}
        maxLength={100}
      />

      <Input
        id="phone"
        label={t.phone}
        type="tel"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
        placeholder="+7 7XX XXX XX XX"
        required
      />

      <Input
        id="email"
        label={locale === "kk" ? "Email (міндетті емес)" : "Email (необязательно)"}
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>
      )}

      <Button type="submit" loading={status === "loading"} className="w-full">
        {t.enroll}
      </Button>
    </form>
  );
}
