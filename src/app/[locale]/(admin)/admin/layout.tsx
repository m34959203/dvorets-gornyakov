import { redirect } from "next/navigation";
import { getMessages, isValidLocale, type Locale } from "@/lib/i18n";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminProviders from "@/components/admin/AdminProviders";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);

  // RBAC guard: только залогиненные admin/editor.
  // instructor убран — на API-уровне роль нигде не разрешена (всё давало 401),
  // полу-сломанный доступ. Вернуть, когда появится реальный instructor-флоу.
  const user = await getCurrentUser();
  if (!user || !["admin", "editor"].includes(user.role)) {
    redirect(`/${locale}/login?next=/${locale}/admin`);
  }

  return (
    <html lang={locale} className="h-full">
      <body className="h-full">
        <AdminProviders locale={locale} role={user.role}>
        <div className="flex h-full">
          <AdminSidebar locale={locale} messages={messages} role={user.role} />
          <div className="flex-1 overflow-auto">
            <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
              <div className="text-sm text-gray-600">
                {locale === "kk" ? "Кіргенсіз:" : "Вошли как:"}{" "}
                <span className="font-semibold text-gray-900">{user.name}</span>
                <span className="ml-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {user.role}
                </span>
              </div>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm font-medium text-gray-600 hover:text-red-600"
                >
                  {locale === "kk" ? "Шығу" : "Выйти"}
                </button>
              </form>
            </header>
            <div className="p-6 lg:p-8">{children}</div>
          </div>
        </div>
        </AdminProviders>
      </body>
    </html>
  );
}
