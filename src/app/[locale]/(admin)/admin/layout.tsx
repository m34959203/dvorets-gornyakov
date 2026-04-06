import { getMessages, isValidLocale, type Locale } from "@/lib/i18n";
import AdminSidebar from "@/components/layout/AdminSidebar";

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

  return (
    <html lang={locale} className="h-full">
      <body className="h-full">
        <div className="flex h-full">
          <AdminSidebar locale={locale} messages={messages} />
          <div className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
