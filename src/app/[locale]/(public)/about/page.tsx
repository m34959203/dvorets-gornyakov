import type { Metadata } from "next";
import { getSiteBaseUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import { isValidLocale, type Locale } from "@/lib/i18n";
import DgPageHero from "@/components/layout/DgPageHero";
import DgIcon from "@/components/layout/DgIcon";
import ContactForm from "@/components/features/ContactForm";



export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: lp } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const title = locale === "kk" ? "Біз туралы" : "О нас";
  const description =
    locale === "kk"
      ? "Ш. Ділдебаев атындағы тау-кенші сарайының тарихы, миссиясы және жетекшілігі — Сәтбаев қаласындағы мәдени орталық (1974/2000)."
      : "История, миссия и руководство Дворца горняков им. Ш. Дильдебаева — культурного центра города Сатпаев (1974/2000).";
  const baseUrl = await getSiteBaseUrl();
  const canonical = `${baseUrl}/${locale}/about`;
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
        kk: `${baseUrl}/kk/about`,
        ru: `${baseUrl}/ru/about`,
      },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const stats = [
    { n: "22",   l: T("Ұжым",      "Коллективов") },
    { n: "758",  l: T("Қатысушы",  "Участников")  },
    { n: "60+",  l: T("Жыл",       "Лет")          },
    { n: "3",    l: T("Зал",       "Зала")         },
  ];

  const formMessages: Record<string, string> = {
    name:          T("Аты-жөні", "ФИО"),
    subject:       T("Тақырып", "Тема"),
    message:       T("Хабарлама", "Сообщение"),
    sendSuccess:   T("Хабарлама жіберілді!", "Сообщение отправлено!"),
    sendError:     T("Жіберу қатесі", "Ошибка отправки"),
    feedbackTitle: T("Кері байланыс", "Обратная связь"),
  };

  return (
    <div className="dg-home">
      {/* ═══ Hero ═══ */}
      <DgPageHero
        crumbs={[
          { label: T("Басты бет", "Главная"), href: `/${locale}` },
          { label: T("Біз туралы", "О нас") },
        ]}
        tag={T("— Сарай туралы —", "— О дворце —")}
        h2Html={T(
          "Ұлытаудың <strong>мәдени</strong> жүрегі",
          "<strong>Главный</strong> культурный дом Улытау"
        )}
        lead={T(
          "1974 жылдан бастап Сәтбаев қаласының мәдени орталығы",
          "Культурный центр города Сатпаев с 1974 года"
        )}
      />

      {/* ═══ About grid: photo + history + stats ═══ */}
      <section className="section section--light" style={{ borderTop: 0 }}>
        <div className="dg-wrap">
          <div className="about-grid">
            <div className="about-photo">
              <Image
                src="/photos/og-cover.jpg"
                alt={T(
                  "Ш. Ділдебаев атындағы тау-кенші сарайы, Сәтбаев қаласы",
                  "Дворец горняков им. Ш. Дильдебаева, г. Сатпаев"
                )}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
              />
              <div className="about-photo-tag">{T("Сәтбаев · 1974", "Сатпаев · 1974")}</div>
            </div>

            <div className="about-text">
              <div className="section-bar">
                <div className="tag">— {T("Тарих", "История")} —</div>
                <h2
                  className="h2"
                  dangerouslySetInnerHTML={{
                    __html: T(
                      "<strong>Байқоңыр</strong>дан Тау-кеншілер сарайына",
                      "От <strong>«Байконура»</strong> до Дворца горняков"
                    ),
                  }}
                />
              </div>

              <p style={{ marginTop: 24 }}>
                <strong>
                  {T(
                    "Ш. Ділдебаев атындағы Тау-кеншілер сарайы",
                    "Дворец горняков им. Ш. Дильдебаева"
                  )}
                </strong>
                {T(
                  " — Ұлытау өңірінің басты мәдени институты. Ғимарат 1974 жылы Сәтбаев қаласында «Байқоңыр» кинотеатры ретінде ашылған. 2000 жылы күрделі жөндеуден кейін мекеме «Ш. Ділдебаев атындағы тау-кенші сарайы» болып қайта аталды; 2001 жылы оның құрамында ақын Шынболат Ділдебаевтың музейі ашылды.",
                  " — главный культурный институт Улытауского региона. Здание построено в 1974 году в городе Сатпаев как кинотеатр «Байконур». В 2000 году после капитального ремонта учреждение переименовано в «Дворец горняков им. Ш. Дильдебаева»; в 2001 году в его составе открыт музей поэта Шынболата Дильдебаева."
                )}
              </p>

              <p style={{ marginTop: 16, color: "var(--dg-text-2)" }}>
                {T(
                  "2019 жылы Сәтбаев қ. әкімінің шешімімен мекеме КМҚК болып қайта құрылды. Ұлытау облысы мәдениет, тілдерді дамыту және мұрағат ісі басқармасына әдістемелік бағынышты.",
                  "В 2019 году решением акима г. Сатпаев учреждение реорганизовано в КГКП «Центр культуры и творчества им. Ш. Дильдебаева». Методически подведомственно Управлению культуры, развития языков и архивного дела области Ұлытау."
                )}
              </p>

              <div className="stats-strip">
                {stats.map((st) => (
                  <div className="stat" key={st.l}>
                    <div className="stat-n"><em>{st.n}</em></div>
                    <div className="stat-l">{st.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Mission ═══ */}
      <section className="section section--light">
        <div className="dg-wrap">
          <div className="section-bar">
            <div className="tag">— {T("Миссия", "Миссия")} —</div>
            <h2
              className="h2"
              dangerouslySetInnerHTML={{
                __html: T(
                  "Дәстүр мен <strong>шығармашылықтың</strong> ұясы",
                  "Хранители традиций и <strong>творчества</strong>"
                ),
              }}
            />
          </div>

          <p style={{ marginTop: 28, maxWidth: 680 }}>
            {T(
              "Біздің миссиямыз — Сәтбаев қаласы мен Ұлытау облысы тұрғындарының мәдени-рухани өмірін байыту, ұлттық дәстүрді сақтау және жас таланттарды қолдау.",
              "Наша миссия — обогащение культурно-духовной жизни жителей города Сатпаев и области Ұлытау, сохранение национальных традиций и поддержка молодых талантов."
            )}
          </p>
          <p style={{ marginTop: 16, maxWidth: 680, color: "var(--dg-text-2)" }}>
            {T(
              "Біз әрбір адамның шығармашылық әлеуетін ашып, дамытуға тырысамыз — балалардан бастап ересектерге дейін.",
              "Мы помогаем раскрыть творческий потенциал каждого человека — от ребёнка до взрослого."
            )}
          </p>
        </div>
      </section>

      {/* ═══ Namesake ═══ */}
      <section className="section section--light">
        <div className="dg-wrap">
          <div className="section-bar">
            <div className="tag">— {T("Сарай аты берілген тұлға", "Имя дворца")} —</div>
            <h2
              className="h2"
              dangerouslySetInnerHTML={{
                __html: T(
                  "Шынболат <strong>Ділдебаев</strong>",
                  "Шынболат <strong>Дильдебаев</strong>"
                ),
              }}
            />
          </div>

          <p style={{ marginTop: 28, maxWidth: 680 }}>
            <strong>
              {T(
                "Шынболат Ділдебаев (1937–1998)",
                "Шынболат Дильдебаев (1937–1998)"
              )}
            </strong>
            {T(
              " — ақын-импровизатор, термеші, ҚР еңбек сіңірген мәдениет қызметкері (1991), Сәтбаев, Қызылорда, Ақтөбе қалаларының құрметті азаматы.",
              " — акын-импровизатор, термеши, Заслуженный работник культуры РК (1991), почётный гражданин городов Сатпаев, Кызылорда, Актобе."
            )}
          </p>

          <div style={{ marginTop: 32 }}>
            <Link href={`/${locale}/clubs`} className="section-link">
              {T("Шығармашылық ұжымдар", "Творческие коллективы")}{" "}
              <DgIcon name="arrow" size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Closing CTA ═══ */}
      <section className="section">
        <div className="dg-wrap">
          <div className="section-bar">
            <div className="tag">— {T("Іс-шаралар", "Афиша")} —</div>
            <h2
              className="h2"
              dangerouslySetInnerHTML={{
                __html: T(
                  "Жақын арадағы <strong>оқиғалар</strong>",
                  "Ближайшие <strong>события</strong>"
                ),
              }}
            />
          </div>
          <p style={{ marginTop: 24, maxWidth: 560, color: "var(--dg-text-2)" }}>
            {T(
              "Концерттер, спектакльдер, шеберханалар — барлық іс-шараларды афишадан қараңыз.",
              "Концерты, спектакли, мастер-классы — смотрите все предстоящие мероприятия в афише."
            )}
          </p>
          <div style={{ marginTop: 32 }}>
            <Link href={`/${locale}/events`} className="section-link">
              {T("Афишаны ашу", "Открыть афишу")}{" "}
              <DgIcon name="arrow" size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Контакты (объединено со страницы /contacts) ═══ */}
      <section className="section" id="contacts">
        <div className="dg-wrap">
          <div className="section-bar">
            <div className="tag">— {T("Байланыс", "Контакты")} —</div>
            <h2
              className="h2"
              dangerouslySetInnerHTML={{
                __html: T("<strong>Байланысыңыз</strong> бізбен", "Свяжитесь <strong>с нами</strong>"),
              }}
            />
          </div>

          <div className="contact-grid" style={{ marginTop: 32 }}>
            {/* Left: contact info */}
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

            {/* Right: feedback form */}
            <div>
              <div className="section-bar" style={{ marginBottom: 28 }}>
                <div className="tag">{T("— Форма —", "— Форма —")}</div>
                <h2
                  className="h2"
                  dangerouslySetInnerHTML={{ __html: T("Кері байланыс", "Обратная <strong>связь</strong>") }}
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
