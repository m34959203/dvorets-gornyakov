"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

type Role = "admin" | "editor";

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  created_at: string;
}

interface FormState {
  email: string;
  password: string;
  name: string;
  role: Role;
}

const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-amber-100 text-amber-800",
  editor: "bg-gray-100 text-gray-800",
};

export default function AdminUsersPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";

  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [listErr, setListErr] = useState<string>("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>({ email: "", password: "", name: "", role: "editor" });
  const [formErr, setFormErr] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setListErr("");
    try {
      const r = await fetch("/api/admin/users");
      const body = await r.json();
      if (r.status === 401 || r.status === 403) {
        setUnauthorized(true);
        setItems([]);
        return;
      }
      if (!r.ok) {
        setListErr(body.error || "Ошибка загрузки");
        return;
      }
      setUnauthorized(false);
      setItems(body.data?.items ?? []);
    } catch {
      setListErr("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ email: "", password: "", name: "", role: "editor" });
    setFormErr("");
    setDrawerOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ email: u.email, password: "", name: u.name, role: u.role });
    setFormErr("");
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
    setFormErr("");
  };

  const handleSave = async () => {
    setFormErr("");
    setSaving(true);
    try {
      if (editing) {
        const payload: { name: string; role: Role; password?: string } = {
          name: form.name,
          role: form.role,
        };
        if (form.password && form.password.length > 0) {
          payload.password = form.password;
        }
        const r = await fetch(`/api/admin/users/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await r.json().catch(() => ({}));
        if (!r.ok) {
          if (r.status === 401 || r.status === 403) {
            setFormErr("Unauthorized");
          } else {
            setFormErr(body.error || "Ошибка");
          }
          return;
        }
      } else {
        const r = await fetch(`/api/admin/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            name: form.name,
            role: form.role,
          }),
        });
        const body = await r.json().catch(() => ({}));
        if (!r.ok) {
          if (r.status === 401 || r.status === 403) {
            setFormErr("Unauthorized");
          } else {
            setFormErr(body.error || "Ошибка");
          }
          return;
        }
      }
      closeDrawer();
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(locale === "kk" ? "Жоюды растайсыз ба?" : "Подтвердите удаление")) return;
    const r = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      alert(body.error || "Ошибка");
      return;
    }
    load();
  };

  const dateLoc = locale === "kk" ? "kk-KZ" : "ru-RU";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "kk" ? "Қолданушылар" : "Пользователи"}
        </h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          {locale === "kk" ? "Жаңа қолданушы" : "Новый пользователь"}
        </button>
      </div>

      {unauthorized && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Unauthorized</div>
      )}
      {listErr && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{listErr}</div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>{locale === "kk" ? "Аты" : "Имя"}</Th>
              <Th>Email</Th>
              <Th>{locale === "kk" ? "Рөлі" : "Роль"}</Th>
              <Th>{locale === "kk" ? "Жасалған" : "Создан"}</Th>
              <Th>{locale === "kk" ? "Әрекеттер" : "Действия"}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  …
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  —
                </td>
              </tr>
            ) : (
              items.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-700">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium " +
                        ROLE_COLORS[u.role]
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString(dateLoc)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-white"
                      >
                        {locale === "kk" ? "Өңдеу" : "Редактировать"}
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
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

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex" onClick={closeDrawer}>
          <div className="flex-1 bg-black/40" />
          <div
            className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editing
                  ? locale === "kk"
                    ? "Қолданушыны өңдеу"
                    : "Редактировать пользователя"
                  : locale === "kk"
                    ? "Жаңа қолданушы"
                    : "Новый пользователь"}
              </h2>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            {formErr && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formErr}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  readOnly={!!editing}
                  disabled={!!editing}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={
                    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm " +
                    (editing ? "bg-gray-50 text-gray-500" : "")
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {locale === "kk" ? "Аты" : "Имя"}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {locale === "kk" ? "Құпиясөз" : "Пароль"}
                  {editing && (
                    <span className="ml-2 text-xs text-gray-500">
                      {locale === "kk"
                        ? "(өзгертпесеңіз — бос қалдырыңыз)"
                        : "(оставьте пустым, чтобы не менять)"}
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {locale === "kk" ? "Рөлі" : "Роль"}
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="editor">editor</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeDrawer}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                {locale === "kk" ? "Болдырмау" : "Отмена"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {locale === "kk" ? "Сақтау" : "Сохранить"}
              </button>
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
