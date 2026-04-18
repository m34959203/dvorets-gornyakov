"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { truncate } from "@/lib/utils";

interface KbItem {
  id: string;
  category: string;
  question_kk: string;
  question_ru: string;
  answer_kk: string;
  answer_ru: string;
  created_at: string;
}

const DEFAULT_CATEGORIES = ["general", "hours", "events", "clubs", "contacts"];

interface FormState {
  category: string;
  question_kk: string;
  question_ru: string;
  answer_kk: string;
  answer_ru: string;
}

const EMPTY_FORM: FormState = {
  category: "general",
  question_kk: "",
  question_ru: "",
  answer_kk: "",
  answer_ru: "",
};

export default function AdminChatbotPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";

  const [items, setItems] = useState<KbItem[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const url = `/api/admin/chatbot-kb${filter !== "all" ? `?category=${encodeURIComponent(filter)}` : ""}`;
      const r = await fetch(url);
      const body = await r.json();
      if (!r.ok) {
        setErr(body.error || (locale === "kk" ? "Жүктеу қатесі" : "Ошибка загрузки"));
        return;
      }
      setItems(body.data?.items ?? []);
    } catch {
      setErr(locale === "kk" ? "Жүктеу қатесі" : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [filter, locale]);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    for (const it of items) if (it.category) set.add(it.category);
    return Array.from(set).sort();
  }, [items]);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormErr("");
    setDrawerOpen(true);
  };

  const openEdit = (item: KbItem) => {
    setEditId(item.id);
    setForm({
      category: item.category,
      question_kk: item.question_kk,
      question_ru: item.question_ru,
      answer_kk: item.answer_kk,
      answer_ru: item.answer_ru,
    });
    setFormErr("");
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormErr("");
  };

  const save = async () => {
    setSaving(true);
    setFormErr("");
    try {
      const url = editId ? `/api/admin/chatbot-kb/${editId}` : "/api/admin/chatbot-kb";
      const method = editId ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await r.json();
      if (!r.ok) {
        setFormErr(body.error || (locale === "kk" ? "Сақтау қатесі" : "Ошибка сохранения"));
        return;
      }
      closeDrawer();
      load();
    } catch {
      setFormErr(locale === "kk" ? "Сақтау қатесі" : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: KbItem) => {
    if (!confirm(locale === "kk" ? "Жоюды растайсыз ба?" : "Подтвердите удаление")) return;
    try {
      const r = await fetch(`/api/admin/chatbot-kb/${item.id}`, { method: "DELETE" });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(body.error || (locale === "kk" ? "Жою қатесі" : "Ошибка удаления"));
        return;
      }
      load();
    } catch {
      setErr(locale === "kk" ? "Жою қатесі" : "Ошибка удаления");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "kk" ? "Чат-бот білім базасы" : "База знаний чат-бота"}
        </h1>
        <Button onClick={openCreate}>
          {locale === "kk" ? "Жаңа" : "Новый"}
        </Button>
      </div>

      <p className="mb-4 text-sm text-gray-600">
        {locale === "kk"
          ? "Чат-бот білім базасы. Бұл сұрақ-жауаптар AI жауаптарын жақсартуға көмектеседі."
          : "База знаний чат-бота. Эти вопросы-ответы помогают улучшить ответы AI."}
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="text-sm text-gray-600">
          {locale === "kk" ? "Санат" : "Категория"}:
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">{locale === "kk" ? "Барлығы" : "Все"}</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>{locale === "kk" ? "Санат" : "Категория"}</Th>
              <Th>{locale === "kk" ? "Сұрақ (RU)" : "Вопрос (RU)"}</Th>
              <Th>{locale === "kk" ? "Жауап (RU)" : "Ответ (RU)"}</Th>
              <Th>{locale === "kk" ? "Әрекеттер" : "Действия"}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">—</td></tr>
            ) : (
              items.map((it) => (
                <tr
                  key={it.id}
                  onClick={() => openEdit(it)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {it.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {truncate(it.question_ru || "", 60)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {truncate(it.answer_ru || "", 80)}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(it)}
                        className="text-sm text-primary hover:underline"
                      >
                        {locale === "kk" ? "Өңдеу" : "Изменить"}
                      </button>
                      <button
                        onClick={() => remove(it)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        {locale === "kk" ? "Жою" : "Удалить"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex" onClick={closeDrawer}>
          <div className="flex-1 bg-black/40" />
          <div
            className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editId
                  ? (locale === "kk" ? "Жазбаны өңдеу" : "Редактировать запись")
                  : (locale === "kk" ? "Жаңа жазба" : "Новая запись")}
              </h2>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            {formErr && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formErr}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === "kk" ? "Санат" : "Категория"}
                </label>
                <div className="flex gap-2">
                  <select
                    value={DEFAULT_CATEGORIES.includes(form.category) ? form.category : "__custom__"}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "__custom__") setForm({ ...form, category: "" });
                      else setForm({ ...form, category: v });
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__custom__">{locale === "kk" ? "Өзге…" : "Другое…"}</option>
                  </select>
                  {!DEFAULT_CATEGORIES.includes(form.category) && (
                    <Input
                      id="kb_cat_custom"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder={locale === "kk" ? "Санат атауы" : "Название категории"}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Textarea
                  id="q_kk"
                  label="Вопрос (KZ)"
                  value={form.question_kk}
                  onChange={(e) => setForm({ ...form, question_kk: e.target.value })}
                  rows={3}
                />
                <Textarea
                  id="q_ru"
                  label="Вопрос (RU)"
                  value={form.question_ru}
                  onChange={(e) => setForm({ ...form, question_ru: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Textarea
                  id="a_kk"
                  label="Ответ (KZ)"
                  value={form.answer_kk}
                  onChange={(e) => setForm({ ...form, answer_kk: e.target.value })}
                  rows={5}
                />
                <Textarea
                  id="a_ru"
                  label="Ответ (RU)"
                  value={form.answer_ru}
                  onChange={(e) => setForm({ ...form, answer_ru: e.target.value })}
                  rows={5}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={closeDrawer}>
                {locale === "kk" ? "Бас тарту" : "Отмена"}
              </Button>
              <Button onClick={save} loading={saving}>
                {locale === "kk" ? "Сақтау" : "Сохранить"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
      {children}
    </th>
  );
}
