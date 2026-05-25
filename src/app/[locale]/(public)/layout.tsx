import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { getMessages, isValidLocale, type Locale } from "@/lib/i18n";
import { playfair, manrope } from "@/lib/fonts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatBot from "@/components/features/ChatBot";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import { getMany } from "@/lib/db";

// Локализованные метаданные: на /kk — казахские (город «Сәтбаев»), на /ru — русские.
// Переопределяют дефолтные (русские) метаданные из корневого layout.
const META = {
  kk: {
    title: "Ш. Дільдебаев атындағы тау-кеншілер сарайы — Сәтбаев",
    template: "%s · Тау-кеншілер сарайы · Сәтбаев",
    desc:
      "«Ш. Дільдебаев атындағы мәдениет және шығармашылық орталығы» КМҚК (Тау-кеншілер сарайы) — Сәтбаев қаласының мәдени орталығы, Ұлытау облысы. 22 ұжым, 3 зал, концерттер мен іс-шаралар афишасы.",
    ogLocale: "kk_KZ",
    siteName: "Ш. Дільдебаев атындағы тау-кеншілер сарайы",
    ogAlt: "Тау-кеншілер сарайы, Сәтбаев қаласы",
  },
  ru: {
    title: "Дворец горняков им. Ш. Дильдебаева — Сатпаев",
    template: "%s · Дворец горняков · Сатпаев",
    desc:
      "КГКП «Центр культуры и творчества им. Ш. Дильдебаева» (Дворец горняков) — культурный центр города Сатпаев, область Ұлытау. 22 коллектива, 3 зала, афиша концертов и событий.",
    ogLocale: "ru_RU",
    siteName: "Дворец горняков им. Ш. Дильдебаева",
    ogAlt: "Дворец горняков им. Ш. Дильдебаева, г. Сатпаев",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: lp } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const m = META[locale];
  return {
    title: { default: m.title, template: m.template },
    description: m.desc,
    alternates: {
      languages: { kk: "/kk", ru: "/ru" },
    },
    openGraph: {
      title: m.title,
      description: m.desc,
      type: "website",
      siteName: m.siteName,
      locale: m.ogLocale,
      images: [{ url: "/photos/og-cover.jpg", width: 1200, height: 630, alt: m.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.desc,
      images: ["/photos/og-cover.jpg"],
    },
  };
}

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
        <a href="#main" className="dg-skip-link">
          {locale === "kk" ? "Мазмұнға өту" : "К содержимому"}
        </a>
        <Header locale={locale} messages={messages} />
        <main id="main" className="flex-1">{children}</main>
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
