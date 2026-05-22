import type { Metadata } from "next";
import { isValidLocale, type Locale } from "@/lib/i18n";
import DgPageHero from "@/components/layout/DgPageHero";
import DgIcon from "@/components/layout/DgIcon";
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
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const formMessages: Record<string, string> = {
    name:         T("Аты-жөні", "ФИО"),
    subject:      T("Тақырып", "Тема"),
    message:      T("Хабарлама", "Сообщение"),
    sendSuccess:  T("Хабарлама жіберілді!", "Сообщение отправлено!"),
    sendError:    T("Жіберу қатесі", "Ошибка отправки"),
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
        h2Html={T(
          "<strong>Байланысыңыз</strong> бізбен",
          "Свяжитесь <strong>с нами</strong>"
        )}
        lead={T(
          "Сарайға келіңіз, қоңырау шалыңыз немесе форм арқылы хабарлама жіберіңіз — біз сізге жауап береміз.",
          "Приходите, звоните или отправьте сообщение через форму — мы обязательно ответим."
        )}
      />

      <section className="section" style={{ borderTop: 0 }}>
        <div className="dg-wrap">
          <div className="contact-grid">

            {/* ─── Left: contact info ─── */}
            <div>
              <div className="contact-list">
                {/* Address */}
                <div className="contact-row">
                  <DgIcon name="pin" size={20} />
                  <div>
                    <div className="lab">{T("Мекенжай", "Адрес")}</div>
                    <div className="val">
                      {T(
                        "К.И. Сәтбаев даңғылы, 106",
                        "Проспект К.И. Сатпаева, 106"
                      )}
                      <br />
                      {T(
                        "101300, Сәтбаев қ., Қазақстан",
                        "101300, г. Сатпаев, Казахстан"
                      )}
                    </div>
                  </div>
                </div>

                {/* Phone support */}
                <div className="contact-row">
                  <DgIcon name="phone" size={20} />
                  <div>
                    <div className="lab">{T("Телефон", "Телефон")}</div>
                    <div className="val">
                      <a href="tel:+77106362330">+7 (71063) 6-23-30</a>
                      <span style={{ opacity: 0.55, marginLeft: 8 }}>
                        — {T("қабылдау", "приёмная")}
                      </span>
                      <br />
                      <a href="tel:+77106362440">+7 (71063) 6-24-40</a>
                      <span style={{ opacity: 0.55, marginLeft: 8 }}>
                        — {T("касса", "касса")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="contact-row">
                  <DgIcon name="mail" size={20} />
                  <div>
                    <div className="lab">Email</div>
                    <div className="val">
                      <a href="mailto:info@dvorets-gornyakov.kz">
                        info@dvorets-gornyakov.kz
                      </a>
                    </div>
                  </div>
                </div>

                {/* Hours */}
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

              {/* Socials row */}
              <div className="dg-foot-socials" style={{ marginTop: 36 }}>
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <DgIcon name="fb" size={22} />
                </a>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <DgIcon name="ig" size={22} />
                </a>
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  <DgIcon name="yt" size={22} />
                </a>
              </div>

              {/* Map link */}
              <div style={{ marginTop: 32 }}>
                <a
                  href="https://2gis.kz/satpaev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dg-btn dg-btn-ghost"
                  style={{ display: "inline-flex" }}
                >
                  <DgIcon name="pin" size={15} />
                  {T("2GIS-те ашу", "Открыть в 2GIS")}
                  <DgIcon name="arrow" size={15} />
                </a>
              </div>
            </div>

            {/* ─── Right: feedback form ─── */}
            <div>
              <div
                className="section-bar"
                style={{ marginBottom: 28 }}
              >
                <div className="tag">{T("— Форма —", "— Форма —")}</div>
                <h2
                  className="h2"
                  dangerouslySetInnerHTML={{
                    __html: T("Кері байланыс", "Обратная <strong>связь</strong>"),
                  }}
                />
              </div>
              <ContactForm locale={locale} messages={formMessages} />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
