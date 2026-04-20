"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const search = useSearchParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "ru";
  const next = search.get("next") || `/${locale}/admin`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await r.json();
      if (!r.ok) {
        setErr(body.error || (locale === "kk" ? "Қате" : "Ошибка входа"));
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setErr(locale === "kk" ? "Желі қатесі" : "Ошибка сети");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-full items-center justify-center mb-4"
               style={{ background: "var(--navy)", color: "var(--ochre)", border: "2px solid var(--ochre)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-head)", color: "var(--navy)" }}>
            {locale === "kk" ? "Әкімшілер кабинеті" : "Кабинет администратора"}
          </h1>
          <p className="text-sm text-[color:var(--ink-2)] mt-2">
            {locale === "kk" ? "Кіру үшін логин мен құпиясөзді енгізіңіз" : "Введите учётные данные для входа"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm border border-[color:var(--line)] p-8 space-y-5">
          {err && (
            <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{err}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-[color:var(--navy)] focus:ring-2 focus:ring-[color:var(--navy)]/10 outline-none"
              placeholder="admin@dvorets.kz"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {locale === "kk" ? "Құпиясөз" : "Пароль"}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-[color:var(--navy)] focus:ring-2 focus:ring-[color:var(--navy)]/10 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg px-4 py-2.5 font-semibold text-white transition disabled:opacity-60"
            style={{ background: "var(--navy)" }}
          >
            {loading ? (locale === "kk" ? "Тексерілуде…" : "Проверка…") : (locale === "kk" ? "Кіру" : "Войти")}
          </button>
        </form>
      </div>
    </div>
  );
}
