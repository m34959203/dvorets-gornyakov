"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

interface KnowledgeItem {
  id: string;
  category: string;
  question_kk: string;
  question_ru: string;
  answer_kk: string;
  answer_ru: string;
}

const initialKnowledge: KnowledgeItem[] = [
  { id: "1", category: "general", question_kk: "Сарай қашан жұмыс істейді?", question_ru: "Когда работает дворец?", answer_kk: "Дс-Жм: 09:00-18:00, Сн-Жс: 10:00-17:00", answer_ru: "Пн-Пт: 09:00-18:00, Сб-Вс: 10:00-17:00" },
  { id: "2", category: "clubs", question_kk: "Үйірмелерге қалай жазылуға болады?", question_ru: "Как записаться в кружок?", answer_kk: "Сайт арқылы немесе әкімшілікке келіп жазыла аласыз.", answer_ru: "Можно записаться через сайт или обратиться в администрацию." },
  { id: "3", category: "events", question_kk: "Келесі іс-шара қашан?", question_ru: "Когда следующее мероприятие?", answer_kk: "Іс-шаралар бетін қараңыз.", answer_ru: "Смотрите на странице мероприятий." },
];

export default function AdminChatbotPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  const messages = getMessages(locale);
  const t = messages.admin;

  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>(initialKnowledge);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<KnowledgeItem | null>(null);
  const [form, setForm] = useState({ category: "general", question_kk: "", question_ru: "", answer_kk: "", answer_ru: "" });

  const openCreate = () => {
    setEditItem(null);
    setForm({ category: "general", question_kk: "", question_ru: "", answer_kk: "", answer_ru: "" });
    setShowModal(true);
  };

  const openEdit = (item: KnowledgeItem) => {
    setEditItem(item);
    setForm({ category: item.category, question_kk: item.question_kk, question_ru: item.question_ru, answer_kk: item.answer_kk, answer_ru: item.answer_ru });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editItem) {
      setKnowledge(knowledge.map((k) => k.id === editItem.id ? { ...k, ...form } : k));
    } else {
      setKnowledge([...knowledge, { id: String(Date.now()), ...form }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(locale === "kk" ? "Жоюды растайсыз ба?" : "Подтвердите удаление")) {
      setKnowledge(knowledge.filter((k) => k.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.chatbot}</h1>
        <Button onClick={openCreate}>{messages.common.create}</Button>
      </div>

      <p className="text-gray-600 mb-4 text-sm">
        {locale === "kk"
          ? "Чат-бот білім базасы. Бұл сұрақ-жауаптар AI жауаптарын жақсартуға көмектеседі."
          : "База знаний чат-бота. Эти вопросы-ответы помогают улучшить ответы AI."}
      </p>

      <div className="space-y-3">
        {knowledge.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{item.category}</span>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Q (KZ): {item.question_kk}</p>
                    <p className="text-sm text-gray-600 mt-1">A: {item.answer_kk}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Q (RU): {item.question_ru}</p>
                    <p className="text-sm text-gray-600 mt-1">A: {item.answer_ru}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button onClick={() => openEdit(item)} className="text-primary hover:text-primary-dark text-sm">{messages.common.edit}</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-sm">{messages.common.delete}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? messages.common.edit : messages.common.create} size="lg">
        <div className="space-y-4">
          <Input id="kb_category" label={locale === "kk" ? "Санат" : "Категория"} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Textarea id="q_kk" label="Question (KZ)" value={form.question_kk} onChange={(e) => setForm({ ...form, question_kk: e.target.value })} rows={2} />
            <Textarea id="q_ru" label="Question (RU)" value={form.question_ru} onChange={(e) => setForm({ ...form, question_ru: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Textarea id="a_kk" label="Answer (KZ)" value={form.answer_kk} onChange={(e) => setForm({ ...form, answer_kk: e.target.value })} rows={3} />
            <Textarea id="a_ru" label="Answer (RU)" value={form.answer_ru} onChange={(e) => setForm({ ...form, answer_ru: e.target.value })} rows={3} />
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
