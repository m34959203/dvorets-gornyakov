import { getMessages, isValidLocale, type Locale } from "@/lib/i18n";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatBot from "@/components/features/ChatBot";

export default async function PublicLayout({
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
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Header locale={locale} messages={messages} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} messages={messages} />
        <ChatBot locale={locale} messages={messages.chatbot} />
      </body>
    </html>
  );
}
