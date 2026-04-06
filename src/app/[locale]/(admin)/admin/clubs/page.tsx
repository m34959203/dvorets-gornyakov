"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

interface ClubItem {
  id: string;
  name_kk: string;
  name_ru: string;
  direction: string;
  age_group: string;
  instructor_name: string;
  is_active: boolean;
}

const initialClubs: ClubItem[] = [
  { id: "1", name_kk: "Вокал студиясы", name_ru: "Вокальная студия", direction: "vocal", age_group: "7-18", instructor_name: "Айгуль Сериковна", is_active: true },
  { id: "2", name_kk: "Халық билері", name_ru: "Народные танцы", direction: "dance", age_group: "5-16", instructor_name: "Динара Маратовна", is_active: true },
  { id: "3", name_kk: "Бейнелеу өнері", name_ru: "Изобразительное искусство", direction: "art", age_group: "6-99", instructor_name: "Бауыржан Нурланович", is_active: true },
  { id: "4", name_kk: "Театр студиясы", name_ru: "Театральная студия", direction: "theater", age_group: "8-18", instructor_name: "Сауле Бекеновна", is_active: false },
];

export default function AdminClubsPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  const messages = getMessages(locale);
  const t = messages.admin;

  const [clubs, setClubs] = useState<ClubItem[]>(initialClubs);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ClubItem | null>(null);
  const [form, setForm] = useState({ name_kk: "", name_ru: "", description_kk: "", description_ru: "", direction: "general", age_group: "", instructor_name: "", is_active: true });

  const openCreate = () => {
    setEditItem(null);
    setForm({ name_kk: "", name_ru: "", description_kk: "", description_ru: "", direction: "general", age_group: "", instructor_name: "", is_active: true });
    setShowModal(true);
  };

  const openEdit = (item: ClubItem) => {
    setEditItem(item);
    setForm({ name_kk: item.name_kk, name_ru: item.name_ru, description_kk: "", description_ru: "", direction: item.direction, age_group: item.age_group, instructor_name: item.instructor_name, is_active: item.is_active });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editItem) {
      setClubs(clubs.map((c) => c.id === editItem.id ? { ...c, name_kk: form.name_kk, name_ru: form.name_ru, direction: form.direction, age_group: form.age_group, instructor_name: form.instructor_name, is_active: form.is_active } : c));
    } else {
      setClubs([{ id: String(Date.now()), name_kk: form.name_kk, name_ru: form.name_ru, direction: form.direction, age_group: form.age_group, instructor_name: form.instructor_name, is_active: form.is_active }, ...clubs]);
    }
    setShowModal(false);
  };

  const toggleActive = (id: string) => {
    setClubs(clubs.map((c) => c.id === id ? { ...c, is_active: !c.is_active } : c));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.clubs}</h1>
        <Button onClick={openCreate}>{messages.common.create}</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 bg-gray-50">
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Атауы" : "Название"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Бағыт" : "Направление"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Жас тобы" : "Возраст"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Жетекші" : "Руководитель"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Белсенді" : "Активен"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Әрекеттер" : "Действия"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clubs.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {locale === "kk" ? item.name_kk : item.name_ru}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.direction}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.age_group}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.instructor_name}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleActive(item.id)} className={`w-10 h-6 rounded-full transition-colors ${item.is_active ? "bg-green-500" : "bg-gray-300"}`}>
                      <span className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${item.is_active ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
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
            <Input id="name_kk" label={`${locale === "kk" ? "Атауы" : "Название"} (KZ)`} value={form.name_kk} onChange={(e) => setForm({ ...form, name_kk: e.target.value })} />
            <Input id="name_ru" label={`${locale === "kk" ? "Атауы" : "Название"} (RU)`} value={form.name_ru} onChange={(e) => setForm({ ...form, name_ru: e.target.value })} />
          </div>
          <Textarea id="desc_kk" label={`${locale === "kk" ? "Сипаттама" : "Описание"} (KZ)`} value={form.description_kk} onChange={(e) => setForm({ ...form, description_kk: e.target.value })} />
          <Textarea id="desc_ru" label={`${locale === "kk" ? "Сипаттама" : "Описание"} (RU)`} value={form.description_ru} onChange={(e) => setForm({ ...form, description_ru: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{locale === "kk" ? "Бағыт" : "Направление"}</label>
              <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="vocal">Vocal</option>
                <option value="dance">Dance</option>
                <option value="art">Art</option>
                <option value="theater">Theater</option>
                <option value="music">Music</option>
                <option value="craft">Craft</option>
                <option value="sport">Sport</option>
                <option value="general">General</option>
              </select>
            </div>
            <Input id="age_group" label={locale === "kk" ? "Жас тобы" : "Возрастная группа"} value={form.age_group} onChange={(e) => setForm({ ...form, age_group: e.target.value })} placeholder="7-18" />
            <Input id="instructor" label={locale === "kk" ? "Жетекші" : "Руководитель"} value={form.instructor_name} onChange={(e) => setForm({ ...form, instructor_name: e.target.value })} />
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
