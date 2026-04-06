"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { getStatusBadgeColor } from "@/lib/utils";

interface EventItem {
  id: string;
  title_kk: string;
  title_ru: string;
  event_type: string;
  start_date: string;
  status: string;
  location: string;
}

const initialEvents: EventItem[] = [
  { id: "1", title_kk: "Наурыз концерті", title_ru: "Концерт Наурыз", event_type: "concert", start_date: "2026-03-22", status: "upcoming", location: "Негізгі зал" },
  { id: "2", title_kk: "Би шеберханасы", title_ru: "Мастер-класс танцев", event_type: "workshop", start_date: "2026-04-15", status: "upcoming", location: "Хореография залы" },
  { id: "3", title_kk: "Суретшілер көрмесі", title_ru: "Выставка художников", event_type: "exhibition", start_date: "2026-05-01", status: "upcoming", location: "Галерея" },
];

export default function AdminEventsPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  const messages = getMessages(locale);
  const t = messages.admin;

  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<EventItem | null>(null);
  const [form, setForm] = useState({ title_kk: "", title_ru: "", description_kk: "", description_ru: "", event_type: "concert", start_date: "", location: "", status: "upcoming" });

  const openCreate = () => {
    setEditItem(null);
    setForm({ title_kk: "", title_ru: "", description_kk: "", description_ru: "", event_type: "concert", start_date: "", location: "", status: "upcoming" });
    setShowModal(true);
  };

  const openEdit = (item: EventItem) => {
    setEditItem(item);
    setForm({ title_kk: item.title_kk, title_ru: item.title_ru, description_kk: "", description_ru: "", event_type: item.event_type, start_date: item.start_date, location: item.location, status: item.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editItem) {
      setEvents(events.map((e) => e.id === editItem.id ? { ...e, title_kk: form.title_kk, title_ru: form.title_ru, event_type: form.event_type, start_date: form.start_date, location: form.location, status: form.status } : e));
    } else {
      setEvents([{ id: String(Date.now()), title_kk: form.title_kk, title_ru: form.title_ru, event_type: form.event_type, start_date: form.start_date, location: form.location, status: form.status }, ...events]);
    }
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.events}</h1>
        <Button onClick={openCreate}>{messages.common.create}</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 bg-gray-50">
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Тақырып" : "Заголовок"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Түрі" : "Тип"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Күні" : "Дата"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Орны" : "Место"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Күйі" : "Статус"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Әрекеттер" : "Действия"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {locale === "kk" ? item.title_kk : item.title_ru}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.event_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.start_date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.location}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => openEdit(item)} className="text-primary hover:text-primary-dark text-sm font-medium">
                      {messages.common.edit}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? messages.common.edit : messages.common.create} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input id="ev_title_kk" label="Title (KZ)" value={form.title_kk} onChange={(e) => setForm({ ...form, title_kk: e.target.value })} />
            <Input id="ev_title_ru" label="Title (RU)" value={form.title_ru} onChange={(e) => setForm({ ...form, title_ru: e.target.value })} />
          </div>
          <Textarea id="ev_desc_kk" label="Description (KZ)" value={form.description_kk} onChange={(e) => setForm({ ...form, description_kk: e.target.value })} />
          <Textarea id="ev_desc_ru" label="Description (RU)" value={form.description_ru} onChange={(e) => setForm({ ...form, description_ru: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{locale === "kk" ? "Түрі" : "Тип"}</label>
              <select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="concert">Concert</option>
                <option value="exhibition">Exhibition</option>
                <option value="workshop">Workshop</option>
                <option value="festival">Festival</option>
                <option value="competition">Competition</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Input id="ev_date" label={locale === "kk" ? "Күні" : "Дата"} type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <Input id="ev_location" label={locale === "kk" ? "Орны" : "Место"} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
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
