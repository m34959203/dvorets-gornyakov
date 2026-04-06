"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminSettingsPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  const messages = getMessages(locale);
  const t = messages.admin;

  const [settings, setSettings] = useState({
    site_name_kk: "Ш. Ділдебаев атындағы тау-кенші сарайы",
    site_name_ru: "Дворец горняков им. Ш. Дільдебаева",
    phone: "+7 (7102) 77-77-77",
    email: "info@dvorets-gornyakov.kz",
    address_kk: "Жезқазған қ., Абай д-лы, 10",
    address_ru: "г. Жезказган, пр. Абая, 10",
    working_hours: "09:00-18:00",
    telegram_channel: "",
    instagram_handle: "",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.settings}</h1>

      <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input id="site_name_kk" label={`${locale === "kk" ? "Сайт атауы" : "Название сайта"} (KZ)`} value={settings.site_name_kk} onChange={(e) => setSettings({ ...settings, site_name_kk: e.target.value })} />
          <Input id="site_name_ru" label={`${locale === "kk" ? "Сайт атауы" : "Название сайта"} (RU)`} value={settings.site_name_ru} onChange={(e) => setSettings({ ...settings, site_name_ru: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input id="s_phone" label={messages.common.phone} value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
          <Input id="s_email" label={messages.common.email} value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input id="s_addr_kk" label={`${messages.common.address} (KZ)`} value={settings.address_kk} onChange={(e) => setSettings({ ...settings, address_kk: e.target.value })} />
          <Input id="s_addr_ru" label={`${messages.common.address} (RU)`} value={settings.address_ru} onChange={(e) => setSettings({ ...settings, address_ru: e.target.value })} />
        </div>
        <Input id="s_hours" label={messages.common.workingHours} value={settings.working_hours} onChange={(e) => setSettings({ ...settings, working_hours: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <Input id="s_telegram" label="Telegram" value={settings.telegram_channel} onChange={(e) => setSettings({ ...settings, telegram_channel: e.target.value })} placeholder="@channel_name" />
          <Input id="s_instagram" label="Instagram" value={settings.instagram_handle} onChange={(e) => setSettings({ ...settings, instagram_handle: e.target.value })} placeholder="@handle" />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>{messages.common.save}</Button>
          {saved && <span className="text-green-600 text-sm">{messages.common.success}</span>}
        </div>
      </div>
    </div>
  );
}
