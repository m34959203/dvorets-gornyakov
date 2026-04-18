import type { Metadata } from "next";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";
import ContactForm from "@/components/features/ContactForm";

const SITE_NAME_KK = "Ш. Ділдебаев атындағы тау-кенші сарайы";
const SITE_NAME_RU = "Дворец горняков им. Ш. Дільдебаева";

function getBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  const fallback = env || "https://dvorets-gornyakov.kz";
  return fallback.replace(/\/$/, "");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: lp } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const title =
    locale === "kk"
      ? `Байланыс — ${SITE_NAME_KK}`
      : `Контакты — ${SITE_NAME_RU}`;
  const description =
    locale === "kk"
      ? "Ш. Ділдебаев атындағы тау-кенші сарайының мекенжайы, телефоны, электрондық поштасы мен жұмыс уақыты."
      : "Адрес, телефон, электронная почта и часы работы Дворца горняков им. Ш. Дільдебаева.";
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/${locale}/contacts`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [],
    },
    alternates: {
      canonical,
      languages: {
        kk: `${baseUrl}/kk/contacts`,
        ru: `${baseUrl}/ru/contacts`,
      },
    },
  };
}

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);
  const t = messages.contacts;
  const c = messages.common;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info + Map */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {locale === "kk" ? "Байланыс ақпараты" : "Контактная информация"}
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <div className="text-sm text-gray-500">{c.address}</div>
                  <div className="font-medium text-gray-900">{messages.footer.address}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <div className="text-sm text-gray-500">{c.phone}</div>
                  <div className="font-medium text-gray-900">+7 (7102) 77-77-77</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="text-sm text-gray-500">{c.email}</div>
                  <div className="font-medium text-gray-900">info@dvorets-gornyakov.kz</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-sm text-gray-500">{c.workingHours}</div>
                  <div className="font-medium text-gray-900">
                    {locale === "kk" ? "Дс-Жм: 09:00-18:00, Сн-Жс: 10:00-17:00" : "Пн-Пт: 09:00-18:00, Сб-Вс: 10:00-17:00"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-sm">
                  {locale === "kk" ? "Жезқазған қ., Абай д-лы, 10" : "г. Жезказган, пр. Абая, 10"}
                </p>
                <p className="text-xs mt-1 text-gray-400">47.7833, 67.7131</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.feedbackTitle}</h2>
            <ContactForm locale={locale} messages={t} />
          </div>
        </div>
      </div>
    </div>
  );
}
