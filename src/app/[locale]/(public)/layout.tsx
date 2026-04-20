import Script from "next/script";
import { Suspense } from "react";
import { getMessages, isValidLocale, type Locale } from "@/lib/i18n";
import { playfair, manrope } from "@/lib/fonts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatBot from "@/components/features/ChatBot";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import { getMany } from "@/lib/db";

interface SettingRow {
  key: string;
  value: string;
}

async function getAnalyticsIds(): Promise<{ ga4Id: string; yaId: string }> {
  try {
    const rows = await getMany<SettingRow>(
      `SELECT key, value FROM site_settings WHERE key IN ('ga4_measurement_id', 'yandex_metrika_id')`
    );
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value ?? "";
    return {
      ga4Id: (map.ga4_measurement_id ?? "").trim(),
      yaId: (map.yandex_metrika_id ?? "").trim(),
    };
  } catch (error) {
    console.error("getAnalyticsIds error:", error);
    return { ga4Id: "", yaId: "" };
  }
}

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
  const { ga4Id, yaId } = await getAnalyticsIds();

  return (
    <html lang={locale} className={`h-full antialiased ${playfair.variable} ${manrope.variable}`}>
      <body className="min-h-full flex flex-col bg-[color:var(--cream)] text-[color:var(--ink)]">
        <Header locale={locale} messages={messages} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} messages={messages} />
        <ChatBot locale={locale} messages={messages.chatbot} />

        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>

        {ga4Id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4Id}');`}
            </Script>
          </>
        )}

        {yaId && (
          <>
            <Script id="ya-metrika-init" strategy="afterInteractive">
              {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(${yaId}, "init", {clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}
            </Script>
            <noscript>
              <div>
                <img
                  src={`https://mc.yandex.ru/watch/${yaId}`}
                  style={{ position: "absolute", left: "-9999px" }}
                  alt=""
                />
              </div>
            </noscript>
          </>
        )}
      </body>
    </html>
  );
}
