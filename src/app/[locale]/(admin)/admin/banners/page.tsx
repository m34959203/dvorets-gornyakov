"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
}

const initialBanners: Banner[] = [
  { id: "1", title: "Наурыз 2026", image_url: "/uploads/banner1.jpg", link_url: "/kk/events/1", is_active: true, sort_order: 1 },
  { id: "2", title: "Жазғы лагерь", image_url: "/uploads/banner2.jpg", link_url: "/kk/news/summer-camp", is_active: true, sort_order: 2 },
];

export default function AdminBannersPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  const messages = getMessages(locale);
  const t = messages.admin;

  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", image_url: "", link_url: "", sort_order: 0 });

  const handleSave = () => {
    setBanners([...banners, { id: String(Date.now()), title: form.title, image_url: form.image_url, link_url: form.link_url, is_active: true, sort_order: form.sort_order }]);
    setShowModal(false);
  };

  const toggleActive = (id: string) => {
    setBanners(banners.map((b) => b.id === id ? { ...b, is_active: !b.is_active } : b));
  };

  const handleDelete = (id: string) => {
    if (confirm(locale === "kk" ? "Жоюды растайсыз ба?" : "Подтвердите удаление")) {
      setBanners(banners.filter((b) => b.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.banners}</h1>
        <Button onClick={() => { setForm({ title: "", image_url: "", link_url: "", sort_order: banners.length + 1 }); setShowModal(true); }}>
          {messages.common.create}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
              {banner.image_url}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                <button onClick={() => toggleActive(banner.id)} className={`w-10 h-6 rounded-full transition-colors ${banner.is_active ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${banner.is_active ? "translate-x-5" : "translate-x-1"}`} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-3">{banner.link_url}</p>
              <Button size="sm" variant="danger" onClick={() => handleDelete(banner.id)}>{messages.common.delete}</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={messages.common.create}>
        <div className="space-y-4">
          <Input id="banner_title" label={locale === "kk" ? "Тақырып" : "Заголовок"} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input id="banner_image" label="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <Input id="banner_link" label="Link URL" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
          <Input id="banner_sort" label={locale === "kk" ? "Реті" : "Порядок"} type="number" value={String(form.sort_order)} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowModal(false)}>{messages.common.cancel}</Button>
            <Button onClick={handleSave}>{messages.common.save}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
