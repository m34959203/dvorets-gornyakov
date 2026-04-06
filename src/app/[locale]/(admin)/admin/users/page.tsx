"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
  created_at: string;
}

const initialUsers: User[] = [
  { id: "1", email: "admin@dvorets.kz", name: "Admin", role: "admin", created_at: "2026-01-01" },
  { id: "2", email: "editor@dvorets.kz", name: "Editor", role: "editor", created_at: "2026-02-15" },
];

export default function AdminUsersPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  const messages = getMessages(locale);
  const t = messages.admin;

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "editor" as "admin" | "editor" });

  const handleSave = () => {
    setUsers([...users, { id: String(Date.now()), email: form.email, name: form.name, role: form.role, created_at: new Date().toISOString().split("T")[0] }]);
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.users}</h1>
        <Button onClick={() => { setForm({ email: "", name: "", password: "", role: "editor" }); setShowModal(true); }}>
          {messages.common.create}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 bg-gray-50">
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Аты" : "Имя"}</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Рөлі" : "Роль"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Жасалған" : "Создан"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={messages.common.create}>
        <div className="space-y-4">
          <Input id="u_name" label={locale === "kk" ? "Аты" : "Имя"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input id="u_email" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input id="u_password" label={locale === "kk" ? "Құпиясөз" : "Пароль"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{locale === "kk" ? "Рөлі" : "Роль"}</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "editor" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
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
