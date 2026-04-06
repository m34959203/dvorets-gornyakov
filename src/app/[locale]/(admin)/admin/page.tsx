import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);
  const t = messages.admin;

  const stats = [
    { label: t.totalNews, value: "24", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z", color: "bg-blue-500" },
    { label: t.totalClubs, value: "8", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "bg-green-500" },
    { label: t.totalEvents, value: "12", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "bg-purple-500" },
    { label: t.pendingEnrollments, value: "5", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", color: "bg-yellow-500" },
  ];

  const recentEnrollments = [
    { child: "Айбек Серіков", club: locale === "kk" ? "Вокал студиясы" : "Вокальная студия", date: "2026-04-05", status: "pending" },
    { child: "Дана Нұрланова", club: locale === "kk" ? "Халық билері" : "Народные танцы", date: "2026-04-04", status: "approved" },
    { child: "Тимур Касымов", club: locale === "kk" ? "Бейнелеу өнері" : "Изобразительное искусство", date: "2026-04-03", status: "pending" },
    { child: "Алина Петрова", club: locale === "kk" ? "Театр студиясы" : "Театральная студия", date: "2026-04-02", status: "approved" },
    { child: "Марат Ахметов", club: locale === "kk" ? "Домбыра үйірмесі" : "Кружок домбры", date: "2026-04-01", status: "rejected" },
  ];

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.dashboard}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Enrollments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{t.recentEnrollments}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 bg-gray-50">
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Бала" : "Ребёнок"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Үйірме" : "Кружок"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Күні" : "Дата"}</th>
                <th className="px-6 py-3 font-medium">{locale === "kk" ? "Күйі" : "Статус"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentEnrollments.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.child}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.club}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                      {statusLabels[item.status]?.[locale]}
                    </span>
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
