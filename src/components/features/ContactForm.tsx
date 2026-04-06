"use client";

import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
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
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-green-800 font-medium">{t.sendSuccess}</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-3 text-sm text-green-600 hover:underline"
        >
          {locale === "kk" ? "Жаңа хабарлама" : "Новое сообщение"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="contact_name"
        label={t.name}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        minLength={2}
      />
      <Input
        id="contact_email"
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <Input
        id="contact_subject"
        label={t.subject}
        value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
        required
        minLength={2}
      />
      <Textarea
        id="contact_message"
        label={t.message}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        required
        minLength={10}
        rows={5}
      />
      <Button type="submit" loading={status === "loading"} className="w-full">
        {locale === "kk" ? "Жіберу" : "Отправить"}
      </Button>
    </form>
  );
}
