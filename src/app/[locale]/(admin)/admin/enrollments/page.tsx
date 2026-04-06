"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";
import Button from "@/components/ui/Button";

interface Enrollment {
  id: string;
  child_name: string;
  child_age: number;
  parent_name: string;
  phone: string;
  club_name: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

const initialEnrollments: Enrollment[] = [
  { id: "1", child_name: "Айбек Серіков", child_age: 10, parent_name: "Серік Ахметов", phone: "+7 701 123 45 67", club_name: "Вокальная студия", status: "pending", created_at: "2026-04-05" },
  { id: "2", child_name: "Дана Нұрланова", child_age: 8, parent_name: "Нұрлан Маратов", phone: "+7 702 234 56 78", club_name: "Народные танцы", status: "approved", created_at: "2026-04-04" },
  { id: "3", child_name: "Тимур Касымов", child_age: 12, parent_name: "Касым Ерланов", phone: "+7 705 345 67 89", club_name: "ИЗО студия", status: "pending", created_at: "2026-04-03" },
  { id: "4", child_name: "Алина Петрова", child_age: 14, parent_name: "Елена Петрова", phone: "+7 777 456 78 90", club_name: "Театральная студия", status: "rejected", created_at: "2026-04-02" },
  { id: "5", child_name: "Марат Ахметов", child_age: 9, parent_name: "Ахмет Серікович", phone: "+7 700 567 89 01", club_name: "Кружок домбры", status: "approved", created_at: "2026-04-01" },
];

export default function AdminEnrollmentsPage() {
  const params = useParams();
  const locale: Locale = isValidLocale(params.locale as string) ? (params.locale as Locale) : "kk";
  const messages = getMessages(locale);
  const t = messages.admin;

  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
  const [filter, setFilter] = useState<string>("all");

  const updateStatus = (id: string, status: "approved" | "rejected") => {
    setEnrollments(enrollments.map((e) => e.id === id ? { ...e, status } : e));
  };

  const filtered = filter === "all" ? enrollments : enrollments.filter((e) => e.status === filter);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, Record<string, string>> = {
    pending: { kk: "Күтуде", ru: "Ожидание" },
    approved: { kk: "Мақұлданды", ru: "Одобрено" },
    rejected: { kk: "Қабылданбады", ru: "Отклонено" },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.enrollments}</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}
          >
            {s === "all" ? (locale === "kk" ? "Барлығы" : "Все") : statusLabels[s]?.[locale]}
            {s !== "all" && ` (${enrollments.filter((e) => e.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 bg-gray-50">
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Бала" : "Ребёнок"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Жасы" : "Возраст"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Ата-ана" : "Родитель"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Телефон" : "Телефон"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Үйірме" : "Кружок"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Күйі" : "Статус"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Әрекеттер" : "Действия"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.child_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.child_age}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.parent_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.club_name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                      {statusLabels[item.status]?.[locale]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateStatus(item.id, "approved")}>
                          {locale === "kk" ? "Мақұлдау" : "Одобрить"}
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => updateStatus(item.id, "rejected")}>
                          {locale === "kk" ? "Қабылдамау" : "Отклонить"}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
