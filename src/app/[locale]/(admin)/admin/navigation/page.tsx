"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

interface NavItem {
  id: string;
  slug: string;
  title_kk: string;
  title_ru: string;
  url: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  target: "_self" | "_blank";
  created_at?: string;
}

type TargetValue = "_self" | "_blank";

interface FormState {
  slug: string;
  title_kk: string;
  title_ru: string;
  url: string;
  parent_id: string;
  target: TargetValue;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  slug: "",
  title_kk: "",
  title_ru: "",
  url: "/",
  parent_id: "",
  target: "_self",
  sort_order: 0,
  is_active: true,
};

export default function AdminNavigationPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";

  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<NavItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    setUnauthorized(false);
    try {
      const r = await fetch("/api/admin/navigation");
      const body = await r.json();
      if (r.status === 401 || r.status === 403) {
        setUnauthorized(true);
        return;
      }
      if (!r.ok) {
        setErr(body.error || "Ошибка загрузки");
        return;
      }
      setItems(body.data?.items ?? []);
    } catch {
      setErr("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Tree: roots first (sorted), then children (sorted) grouped under each root.
  const sortedTree = useMemo(() => {
    const roots = items
      .filter((i) => !i.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const kids = new Map<string, NavItem[]>();
    for (const i of items) {
      if (i.parent_id) {
        const arr = kids.get(i.parent_id) ?? [];
        arr.push(i);
        kids.set(i.parent_id, arr);
      }
    }
    for (const arr of kids.values()) arr.sort((a, b) => a.sort_order - b.sort_order);
    const ordered: { item: NavItem; depth: 0 | 1 }[] = [];
    for (const root of roots) {
      ordered.push({ item: root, depth: 0 });
      for (const child of kids.get(root.id) ?? []) ordered.push({ item: child, depth: 1 });
    }
    // Orphans (parent_id points to nothing) — shouldn't normally happen
    const rootIds = new Set(roots.map((r) => r.id));
    for (const i of items) {
      if (i.parent_id && !rootIds.has(i.parent_id) && !ordered.find((o) => o.item.id === i.id)) {
        ordered.push({ item: i, depth: 1 });
      }
    }
    return ordered;
  }, [items]);

  const rootOptions = useMemo(
    () => items.filter((i) => !i.parent_id).sort((a, b) => a.sort_order - b.sort_order),
    [items]
  );

  const openCreate = () => {
    setEditing(null);
    const nextSort = items.length
      ? Math.max(...items.filter((i) => !i.parent_id).map((i) => i.sort_order), 0) + 10
      : 10;
    setForm({ ...EMPTY_FORM, sort_order: nextSort });
    setFormErr("");
    setDrawerOpen(true);
  };

  const openEdit = (n: NavItem) => {
    setEditing(n);
    setForm({
      slug: n.slug,
      title_kk: n.title_kk,
      title_ru: n.title_ru,
      url: n.url,
      parent_id: n.parent_id ?? "",
      target: n.target,
      sort_order: n.sort_order,
      is_active: n.is_active,
    });
    setFormErr("");
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
  };

  const onSave = async () => {
    setFormErr("");
    if (!form.slug.trim() || !form.title_kk.trim() || !form.title_ru.trim() || !form.url.trim()) {
      setFormErr(locale === "kk" ? "Барлық міндетті өрістерді толтырыңыз" : "Заполните обязательные поля");
      return;
    }
    const payload = {
      slug: form.slug.trim(),
      title_kk: form.title_kk.trim(),
      title_ru: form.title_ru.trim(),
      url: form.url.trim(),
      parent_id: form.parent_id ? form.parent_id : null,
      target: form.target,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
    setSaving(true);
    try {
      const url = editing ? `/api/admin/navigation/${editing.id}` : `/api/admin/navigation`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await r.json();
      if (!r.ok) {
        setFormErr(body.error || "Ошибка сохранения");
        return;
      }
      closeDrawer();
      load();
    } catch {
      setFormErr("Сетевая ошибка");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (n: NavItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const msg = locale === "kk" ? "Шынымен жоясыз ба?" : "Удалить пункт меню?";
    if (!confirm(msg)) return;
    try {
      const r = await fetch(`/api/admin/navigation/${n.id}`, { method: "DELETE" });
      const body = await r.json();
      if (!r.ok) {
        alert(body.error || "Ошибка");
        return;
      }
      if (editing?.id === n.id) closeDrawer();
      load();
    } catch {
      alert("Сетевая ошибка");
    }
  };

  const onToggleActive = async (n: NavItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const r = await fetch(`/api/admin/navigation/${n.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: n.slug,
          title_kk: n.title_kk,
          title_ru: n.title_ru,
          url: n.url,
          parent_id: n.parent_id,
          target: n.target,
          sort_order: n.sort_order,
          is_active: !n.is_active,
        }),
      });
      const body = await r.json();
      if (!r.ok) {
        alert(body.error || "Ошибка");
        return;
      }
      load();
    } catch {
      alert("Сетевая ошибка");
    }
  };

  const onReorder = async (n: NavItem, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const r = await fetch(`/api/admin/navigation/${n.id}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      const body = await r.json();
      if (!r.ok) {
        alert(body.error || "Ошибка");
        return;
      }
      load();
    } catch {
      alert("Сетевая ошибка");
    }
  };

  if (unauthorized) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        {locale === "kk" ? "Рұқсат жоқ" : "Unauthorized"}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "kk" ? "Навигация мәзірі" : "Меню навигации"}
        </h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          {locale === "kk" ? "Пункт қосу" : "Добавить пункт"}
        </button>
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>{locale === "kk" ? "Атауы" : "Название"}</Th>
              <Th>URL</Th>
              <Th>Slug</Th>
              <Th>{locale === "kk" ? "Терезе" : "Окно"}</Th>
              <Th>{locale === "kk" ? "Реті" : "Порядок"}</Th>
              <Th>{locale === "kk" ? "Белсенді" : "Активен"}</Th>
              <Th>{locale === "kk" ? "Әрекет" : "Действия"}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">…</td></tr>
            ) : sortedTree.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">—</td></tr>
            ) : (
              sortedTree.map(({ item, depth }) => {
                const title = locale === "kk" ? item.title_kk : item.title_ru;
                return (
                  <tr
                    key={item.id}
                    onClick={() => openEdit(item)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td
                      className={
                        "px-4 py-3 " +
                        (depth === 0
                          ? "font-semibold text-gray-900"
                          : "pl-10 text-gray-700")
                      }
                    >
                      {depth === 1 && <span className="mr-2 text-gray-300">└</span>}
                      {title}
                    </td>
                    <td className="px-4 py-3 max-w-[240px] truncate text-gray-600">
                      {item.url}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.slug}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.target === "_blank"
                        ? (locale === "kk" ? "Жаңа" : "Новое")
                        : (locale === "kk" ? "Осы" : "Это")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => onReorder(item, "up", e)}
                          className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
                          aria-label="up"
                        >
                          ▲
                        </button>
                        <span className="w-8 text-center text-gray-700">{item.sort_order}</span>
                        <button
                          onClick={(e) => onReorder(item, "down", e)}
                          className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
                          aria-label="down"
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => onToggleActive(item, e)}
                        className={
                          "w-10 h-6 rounded-full transition-colors " +
                          (item.is_active ? "bg-emerald-500" : "bg-gray-300")
                        }
                        aria-label="toggle"
                      >
                        <span
                          className={
                            "block w-4 h-4 bg-white rounded-full shadow transform transition-transform " +
                            (item.is_active ? "translate-x-5" : "translate-x-1")
                          }
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => onDelete(item, e)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        {locale === "kk" ? "Жою" : "Удалить"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
                  ? (locale === "kk" ? "Пунктті өзгерту" : "Редактировать пункт")
                  : (locale === "kk" ? "Жаңа пункт" : "Новый пункт")}
              </h2>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            {formErr && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formErr}</div>}

            <div className="grid grid-cols-1 gap-4">
              <Field label="Slug">
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="about-us"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
                />
              </Field>

              <Field label={locale === "kk" ? "Атауы (KK)" : "Название (KK)"}>
                <input
                  value={form.title_kk}
                  onChange={(e) => setForm({ ...form, title_kk: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>

              <Field label={locale === "kk" ? "Атауы (RU)" : "Название (RU)"}>
                <input
                  value={form.title_ru}
                  onChange={(e) => setForm({ ...form, title_ru: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>

              <Field label="URL">
                <input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="/news  /  https://…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-xs text-gray-500">
                  {locale === "kk"
                    ? "Ішкі: /news (локаль автоматты). Сыртқы: https://…"
                    : "Внутренние: /news (локаль добавляется автоматически). Внешние: https://…"}
                </span>
              </Field>

              <Field label={locale === "kk" ? "Аға пункт" : "Родительский пункт"}>
                <select
                  value={form.parent_id}
                  onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">
                    {locale === "kk" ? "— Түбір (жоқ) —" : "— Корневой (нет) —"}
                  </option>
                  {rootOptions
                    .filter((r) => !editing || r.id !== editing.id)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {locale === "kk" ? r.title_kk : r.title_ru}
                      </option>
                    ))}
                </select>
              </Field>

              <Field label={locale === "kk" ? "Терезе" : "Открывать в"}>
                <select
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value as TargetValue })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="_self">
                    {locale === "kk" ? "Осы терезе" : "Этой вкладке"}
                  </option>
                  <option value="_blank">
                    {locale === "kk" ? "Жаңа терезе" : "Новой вкладке"}
                  </option>
                </select>
              </Field>

              <Field label={locale === "kk" ? "Белсенді" : "Активен"}>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">
                    {form.is_active
                      ? (locale === "kk" ? "Иә" : "Да")
                      : (locale === "kk" ? "Жоқ" : "Нет")}
                  </span>
                </label>
              </Field>

              {editing && (
                <div className="text-xs text-gray-500">
                  {locale === "kk" ? "Реті" : "Порядок"}: <b>{form.sort_order}</b>{" "}
                  <span className="text-gray-400">
                    ({locale === "kk" ? "▲/▼ тізімде" : "меняйте ▲/▼ в таблице"})
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                {editing && (
                  <button
                    type="button"
                    onClick={() => onDelete(editing)}
                    className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    {locale === "kk" ? "Жою" : "Удалить"}
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  {locale === "kk" ? "Болдырмау" : "Отмена"}
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                >
                  {saving
                    ? (locale === "kk" ? "Сақталуда…" : "Сохранение…")
                    : (locale === "kk" ? "Сақтау" : "Сохранить")}
                </button>
              </div>
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

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={"block " + (className ?? "")}>
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
