import type { Metadata } from "next";
import { getSiteBaseUrl } from "@/lib/site-url";
import { isValidLocale, type Locale } from "@/lib/i18n";
import DgPageHero from "@/components/layout/DgPageHero";
import DgIcon from "@/components/layout/DgIcon";
import ContactForm from "@/components/features/ContactForm";

export const dynamic = "force-dynamic";

// Точный поиск объекта в 2GIS по адресу (открывается в новой вкладке/приложении 2GIS).
// Встроенный интерактивный виджет 2GIS требует ключа MapGL / зарегистрированного
// виджета под аккаунтом 2GIS учреждения — после его получения карту-панель ниже
// можно заменить на <iframe src="https://widgets.2gis.com/...">.
const GIS_SEARCH =
  "https://2gis.kz/satpaev/search/" +
  encodeURIComponent("проспект К.И. Сатпаева 106");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: lp } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const title = locale === "kk" ? "Байланыс" : "Контакты";
  const description =
    locale === "kk"
      ? "Ш. Ділдебаев атындағы тау-кенші сарайының мекенжайы, телефондары, жұмыс уақыты және картадағы орналасуы (2GIS) — Сәтбаев қаласы."
      : "Адрес, телефоны, часы работы и расположение на карте (2GIS) Дворца горняков им. Ш. Дильдебаева — город Сатпаев.";
  const baseUrl = await getSiteBaseUrl();
  const canonical = `${baseUrl}/${locale}/contacts`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: "/photos/og-cover.jpg",
          width: 1200,
          height: 630,
          alt:
            locale === "kk"
              ? "Ш. Ділдебаев атындағы тау-кенші сарайы, Сәтбаев қаласы"
              : "Дворец горняков им. Ш. Дильдебаева, г. Сатпаев",
        },
      ],
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
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const formMessages: Record<string, string> = {
    name: T("Аты-жөні", "ФИО"),
    subject: T("Тақырып", "Тема"),
    message: T("Хабарлама", "Сообщение"),
    sendSuccess: T("Хабарлама жіберілді!", "Сообщение отправлено!"),
    sendError: T("Жіберу қатесі", "Ошибка отправки"),
    feedbackTitle: T("Кері байланыс", "Обратная связь"),
  };

  return (
    <div className="dg-home">
      <DgPageHero
        crumbs={[
          { label: T("Басты бет", "Главная"), href: `/${locale}` },
          { label: T("Байланыс", "Контакты") },
        ]}
        tag={T("— Байланыс —", "— Контакты —")}
        h2Html={T("Бізді <strong>қалай табуға</strong> болады", "Как нас <strong>найти</strong>")}
        lead={T(
          "Мекенжай, телефондар, жұмыс уақыты және картадағы орналасуы.",
          "Адрес, телефоны, часы работы и расположение на карте."
        )}
      />

      <section className="section" style={{ borderTop: 0 }}>
        <div className="dg-wrap">
          <div className="contact-grid">
            {/* ── Контактные данные ── */}
            <div>
              <div className="contact-list">
                <div className="contact-row">
                  <DgIcon name="pin" size={20} />
                  <div>
                    <div className="lab">{T("Мекенжай", "Адрес")}</div>
                    <div className="val">
                      {T("К.И. Сәтбаев даңғылы, 106", "Проспект К.И. Сатпаева, 106")}
                      <br />
                      {T("101300, Сәтбаев қ., Қазақстан", "101300, г. Сатпаев, Казахстан")}
                    </div>
                  </div>
                </div>

                <div className="contact-row">
                  <DgIcon name="phone" size={20} />
                  <div>
                    <div className="lab">{T("Телефон", "Телефон")}</div>
                    <div className="val">
                      <a href="tel:+77106362330">+7 (71063) 6-23-30</a>
                      <span style={{ opacity: 0.55, marginLeft: 8 }}>— {T("қабылдау", "приёмная")}</span>
                      <br />
                      <a href="tel:+77106362440">+7 (71063) 6-24-40</a>
                      <span style={{ opacity: 0.55, marginLeft: 8 }}>— {T("касса", "касса")}</span>
                    </div>
                  </div>
                </div>

                <div className="contact-row">
                  <DgIcon name="mail" size={20} />
                  <div>
                    <div className="lab">Email</div>
                    <div className="val">
                      <a href="mailto:info@dvorets-gornyakov.kz">info@dvorets-gornyakov.kz</a>
                    </div>
                  </div>
                </div>

                <div className="contact-row">
                  <DgIcon name="clock" size={20} />
                  <div>
                    <div className="lab">{T("Жұмыс уақыты", "Часы работы")}</div>
                    <div className="val">
                      {T("Дс–Жм: 09:00–18:00", "Пн–Пт: 09:00–18:00")}
                      <br />
                      {T("Сн–Жс: 10:00–17:00", "Сб–Вс: 10:00–17:00")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="dg-foot-socials" style={{ marginTop: 36 }}>
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <DgIcon name="fb" size={22} />
                </a>
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <DgIcon name="ig" size={22} />
                </a>
                <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <DgIcon name="yt" size={22} />
                </a>
              </div>
            </div>

            {/* ── Карта 2GIS (deep-link панель) ── */}
            <a
              href={GIS_SEARCH}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-map contact-map-card"
              aria-label={T("2GIS картасынан ашу", "Открыть на карте 2GIS")}
            >
              <span className="contact-map-pin" aria-hidden="true">
                <DgIcon name="pin" size={30} />
              </span>
              <span className="contact-map-meta">
                <span className="contact-map-addr">
                  {T("К.И. Сәтбаев даңғылы, 106 · Сәтбаев", "Проспект К.И. Сатпаева, 106 · Сатпаев")}
                </span>
                <span className="contact-map-cta">
                  {T("2GIS картасынан ашу", "Открыть на карте 2GIS")}
                  <DgIcon name="arrow" size={15} />
                </span>
              </span>
            </a>
          </div>

          {/* ── Форма обратной связи ── */}
          <div style={{ maxWidth: 640, margin: "72px auto 0" }}>
            <div className="section-bar" style={{ marginBottom: 28, textAlign: "center" }}>
              <div className="tag">{T("— Форма —", "— Форма —")}</div>
              <h2
                className="h2"
                dangerouslySetInnerHTML={{ __html: T("Кері <strong>байланыс</strong>", "Обратная <strong>связь</strong>") }}
              />
            </div>
            <ContactForm locale={locale} messages={formMessages} />
          </div>
        </div>
      </section>
    </div>
  );
}
