"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { getStatusBadgeColor } from "@/lib/utils";

interface NewsItem {
  id: string;
  slug: string;
  title_kk: string;
  title_ru: string;
  status: string;
  category: string;
  published_at: string | null;
}

const initialNews: NewsItem[] = [
  { id: "1", slug: "nauryz-2026", title_kk: "Наурыз мерекесіне шақырамыз!", title_ru: "Приглашаем на праздник Наурыз!", status: "published", category: "events", published_at: "2026-03-15" },
  { id: "2", slug: "new-clubs-2026", title_kk: "Жаңа оқу жылына үйірмелерге жазылу", title_ru: "Запись в кружки на новый учебный год", status: "published", category: "announcement", published_at: "2026-03-10" },
  { id: "3", slug: "competition-results", title_kk: "Байқау нәтижелері", title_ru: "Результаты конкурса", status: "draft", category: "news", published_at: null },
];

export default function AdminNewsPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  const messages = getMessages(locale);
  const t = messages.admin;

  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [form, setForm] = useState({ title_kk: "", title_ru: "", content_kk: "", content_ru: "", category: "news", status: "draft" });

  const openCreate = () => {
    setEditItem(null);
    setForm({ title_kk: "", title_ru: "", content_kk: "", content_ru: "", category: "news", status: "draft" });
    setShowModal(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditItem(item);
    setForm({ title_kk: item.title_kk, title_ru: item.title_ru, content_kk: "", content_ru: "", category: item.category, status: item.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editItem) {
      setNews(news.map((n) => n.id === editItem.id ? { ...n, ...form, title_kk: form.title_kk, title_ru: form.title_ru } : n));
    } else {
      const newItem: NewsItem = {
        id: String(Date.now()),
        slug: form.title_ru.toLowerCase().replace(/\s+/g, "-").slice(0, 50),
        title_kk: form.title_kk,
        title_ru: form.title_ru,
        status: form.status,
        category: form.category,
        published_at: form.status === "published" ? new Date().toISOString().split("T")[0] : null,
      };
      setNews([newItem, ...news]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(locale === "kk" ? "Жоюды растайсыз ба?" : "Подтвердите удаление")) {
      setNews(news.filter((n) => n.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.news}</h1>
        <Button onClick={openCreate}>{messages.common.create}</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 bg-gray-50">
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Тақырып (KZ)" : "Заголовок (KZ)"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Тақырып (RU)" : "Заголовок (RU)"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Санат" : "Категория"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Күйі" : "Статус"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Әрекеттер" : "Действия"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-[200px] truncate">{item.title_kk}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{item.title_ru}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-primary hover:text-primary-dark text-sm font-medium">
                        {messages.common.edit}
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                        {messages.common.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? messages.common.edit : messages.common.create} size="lg">
        <div className="space-y-4">
          <Input id="title_kk" label={`${locale === "kk" ? "Тақырып" : "Заголовок"} (KZ)`} value={form.title_kk} onChange={(e) => setForm({ ...form, title_kk: e.target.value })} />
          <Input id="title_ru" label={`${locale === "kk" ? "Тақырып" : "Заголовок"} (RU)`} value={form.title_ru} onChange={(e) => setForm({ ...form, title_ru: e.target.value })} />
          <Textarea id="content_kk" label={`${locale === "kk" ? "Мазмұны" : "Содержание"} (KZ)`} value={form.content_kk} onChange={(e) => setForm({ ...form, content_kk: e.target.value })} />
          <Textarea id="content_ru" label={`${locale === "kk" ? "Мазмұны" : "Содержание"} (RU)`} value={form.content_ru} onChange={(e) => setForm({ ...form, content_ru: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input id="category" label={locale === "kk" ? "Санат" : "Категория"} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{locale === "kk" ? "Күйі" : "Статус"}</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="draft">{locale === "kk" ? "Жоба" : "Черновик"}</option>
                <option value="published">{locale === "kk" ? "Жарияланған" : "Опубликовано"}</option>
                <option value="archived">{locale === "kk" ? "Мұрағатталған" : "В архиве"}</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowModal(false)}>{messages.common.cancel}</Button>
            <Button onClick={handleSave}>{messages.common.save}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
