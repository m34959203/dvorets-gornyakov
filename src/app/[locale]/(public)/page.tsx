import type { Metadata } from "next";
import { getSiteBaseUrl } from "@/lib/site-url";
import Link from "next/link";
import Image from "next/image";
import { isValidLocale, type Locale, getLocalizedField } from "@/lib/i18n";
import { getMany } from "@/lib/db";
import { almatyParts } from "@/lib/utils";
import { eventImage } from "@/lib/event-image";
import { localizeVenue, type VenuePair } from "@/lib/venue";
import { organizationJsonLd } from "@/lib/jsonld";
import JsonLd from "@/components/JsonLd";
import DgIcon from "@/components/layout/DgIcon";

export const dynamic = "force-dynamic";

// Главной не хватало canonical (метаданные иначе из (public)/layout). Мерджится с title/og слоя.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: lp } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const base = await getSiteBaseUrl();
  return {
    alternates: {
      canonical: `${base}/${locale}`,
      languages: { kk: `${base}/kk`, ru: `${base}/ru` },
    },
  };
}

interface EventRow {
  id: string;
  title_kk: string;
  title_ru: string;
  description_kk: string;
  description_ru: string;
  image_url: string | null;
  event_type: string;
  start_date: string;
  location: string;
}

interface NewsRow {
  id: string;
  slug: string;
  title_kk: string;
  title_ru: string;
  excerpt_kk: string;
  excerpt_ru: string;
  image_url: string | null;
  published_at: string | null;
}

interface HallRow {
  slug: string;
  name_kk: string;
  name_ru: string;
  capacity: number;
  description_kk: string;
  description_ru: string;
}

const MONTHS_KK = ["қаң.", "ақп.", "нау.", "сәу.", "мам.", "мау.", "шіл.", "там.", "қыр.", "қаз.", "қар.", "жел."];
const MONTHS_RU = ["янв.", "фев.", "мар.", "апр.", "мая", "июн.", "июл.", "авг.", "сен.", "окт.", "ноя.", "дек."];
const WEEKDAYS_KK = ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"];
const WEEKDAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

// Залы → тематическая обложка (см. sql/023, halls.photos): grand=08, chamber=10, rehearsal=12.
const HALL_PHOTO: Record<string, string> = {
  grand: "/photos/dvorets-08.webp",
  chamber: "/photos/dvorets-10.webp",
  rehearsal: "/photos/dvorets-12.webp",
};

function formatDateChip(dateIso: string, locale: Locale) {
  const d = new Date(dateIso);
  const p = almatyParts(d);
  return {
    d: String(p.day).padStart(2, "0"),
    m: (locale === "kk" ? MONTHS_KK : MONTHS_RU)[p.month].toUpperCase(),
    wd: (locale === "kk" ? WEEKDAYS_KK : WEEKDAYS_RU)[p.weekday],
    time: d.toLocaleTimeString(locale === "kk" ? "kk-KZ" : "ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Almaty",
    }),
  };
}

function formatNewsDate(iso: string | null, locale: Locale): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale === "kk" ? "kk-KZ" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Almaty",
  });
}

async function load() {
  async function safe<T>(q: Promise<T[]>): Promise<T[]> {
    try {
      return await q;
    } catch {
      return [];
    }
  }
  const events = await safe<EventRow>(
    getMany<EventRow>(
      `SELECT * FROM events WHERE status IN ('upcoming','ongoing') AND start_date >= NOW() ORDER BY start_date ASC LIMIT 12`
    )
  );
  // events.location — свободный текст, локализуем по парам из halls (см. lib/venue.ts)
  const hallPairs = await safe<VenuePair>(
    getMany<VenuePair>(`SELECT name_kk AS kk, name_ru AS ru FROM halls`)
  );
  const news = await safe<NewsRow>(
    getMany<NewsRow>(
      `SELECT id, slug, title_kk, title_ru,
              COALESCE(excerpt_kk,'') AS excerpt_kk, COALESCE(excerpt_ru,'') AS excerpt_ru,
              image_url, published_at
         FROM news WHERE status='published'
        ORDER BY published_at DESC NULLS LAST LIMIT 3`
    )
  );
  const halls = await safe<HallRow>(
    getMany<HallRow>(
      `SELECT slug, name_kk, name_ru, capacity,
              COALESCE(description_kk,'') AS description_kk, COALESCE(description_ru,'') AS description_ru
         FROM halls WHERE is_active = true ORDER BY sort_order LIMIT 3`
    )
  );
  // Без демо-фолбэка: нет будущих событий → честный empty state, а не показ прошлого.
  return { events, hallPairs, news, halls };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const { events, hallPairs, news, halls } = await load();
  const titleOf = (e: EventRow) =>
    getLocalizedField(e as unknown as Record<string, unknown>, "title", locale);

  // ── Афиша: featured (главное событие) + 3 ближайших (полная афиша — на /events) ──
  const feature = events[0];
  const featureChip = feature ? formatDateChip(feature.start_date, locale) : null;
  const featureParts = feature ? almatyParts(feature.start_date) : null;
  const posters = events.slice(1, 4);

  // ── Творческие составы: на главной 6 из 22 (полный список на /clubs) ──
  // photo — тематическая привязка к набору AI-изображений (НЕ round-robin).
  const collectives: Array<{ name: string; since: string; photo: string }> = [
    { name: T("«Арман» халық ансамблі", "Народный ансамбль «Арман»"), since: T("1975 ж.", "С 1975 г."), photo: "/photos/dvorets-07.webp" },
    { name: T("Хореография", "Хореография"), since: T("1980 ж.", "С 1980 г."), photo: "/photos/dvorets-11.webp" },
    { name: T("Вокал студиясы", "Вокальная студия"), since: T("1985 ж.", "С 1985 г."), photo: "/photos/dvorets-05.webp" },
    { name: T("Театр студиясы", "Театральная студия"), since: T("1978 ж.", "С 1978 г."), photo: "/photos/dvorets-09-1.webp" },
    { name: T("Қобыз ансамблі", "Кобыз ансамбль"), since: T("1990 ж.", "С 1990 г."), photo: "/photos/dvorets-04.webp" },
    { name: T("Домбыра ансамблі", "Домбра ансамбль"), since: T("1976 ж.", "С 1976 г."), photo: "/photos/dvorets-03.webp" },
  ];

  const circles = [
    { id: "vocal", label: T("Вокал", "Вокал"), icon: "mic" as const },
    { id: "dance", label: T("Би", "Танцы"), icon: "dance" as const },
    { id: "music", label: T("Музыка", "Музыка"), icon: "music" as const },
    { id: "theater", label: T("Театр", "Театр"), icon: "theatre" as const },
    { id: "art", label: T("Сурет", "Рисование"), icon: "brush" as const },
    { id: "sport", label: T("Спорт", "Спорт"), icon: "sport" as const },
    { id: "craft", label: T("Қолөнер", "Ремёсла"), icon: "craft" as const },
    { id: "general", label: T("Жалпы", "Общее"), icon: "stars" as const },
  ];

  const stats = [
    { n: "22", l: T("Ұжым", "Коллективов") },
    { n: "758", l: T("Қатысушы", "Участников") },
    { n: "60+", l: T("Жыл", "Лет") },
    { n: "3", l: T("Зал", "Зала") },
  ];

  const posterDate = (e: EventRow) => {
    const c = formatDateChip(e.start_date, locale);
    const p = almatyParts(e.start_date);
    return `${parseInt(c.d, 10)} ${(locale === "kk" ? MONTHS_KK : MONTHS_RU)[p.month]} ${p.year}, ${c.time}`;
  };

  // Google Maps embed по адресу (без API-ключа). CSP в проде не ограничивает frame-src.
  const mapSrc =
    "https://maps.google.com/maps?q=" +
    encodeURIComponent("Сатпаев, проспект К.И. Сатпаева 106") +
    "&z=16&output=embed";

  return (
    <div className="dg-home">
      <JsonLd data={organizationJsonLd(locale)} />
      <a href="#afisha" className="dg-skip-link">{T("Мазмұнға өту", "Перейти к содержимому")}</a>

      {/* ═══ Hero ═══ */}
      <section className="hero" id="home">
        <Image className="hero-photo" src="/hero/hero.jpg" alt="" fill priority sizes="100vw" />
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-inner">
          {/* KK-заголовок длиннее RU → отдельный класс с меньшим floor (см. globals.css),
              чтобы ужать число строк на мобильном БЕЗ влияния на /ru. */}
          <h1 className={locale === "kk" ? "hero-h1 hero-h1--kk" : "hero-h1"}>
            {locale === "kk" ? (
              <>
                Сүйікті әртістеріңізді <strong>ең үздік залда</strong> қарсы алыңыз — Сәтбаев қаласында
              </>
            ) : (
              <>
                Встречайте своих любимых артистов <strong>в лучшем зале</strong> города Сатпаев
              </>
            )}
          </h1>
          <div className="hero-cta">
            <Link href={`/${locale}/events`} className="dg-btn">
              <DgIcon name="calendar" size={16} /> {T("Афиша", "Афиша")}
            </Link>
            <Link href={`/${locale}/rent`} className="dg-btn dg-btn-ghost">
              <DgIcon name="pin" size={16} /> {T("Зал жалға алу", "Аренда залов")}
            </Link>
          </div>
        </div>
        <a href="#afisha" className="hero-scroll" aria-label={T("Төмен айналдыру", "Прокрутить вниз")}>
          <div className="hero-mouse" />
          <span>{T("Айналдыру", "Прокрутить")}</span>
        </a>
      </section>

      {/* ═══ Афиша пуста — честный empty state (без показа прошлого как настоящего) ═══ */}
      {events.length === 0 && (
        <section className="section section--light" id="afisha">
          <div className="dg-wrap">
            <div className="dg-empty" style={{ textAlign: "center" }}>
              <DgIcon name="calendar" size={36} stroke={1.1} />
              <h2 className="h2" style={{ marginTop: 16 }}>{T("Маусым бағдарламасы жақын арада", "Программа сезона скоро")}</h2>
              <p style={{ marginTop: 12, color: "var(--dg-text-2)" }}>
                {T("Жаңа іс-шаралар дайындалып жатыр. Толық афишаны қараңыз.", "Готовим новые события. Загляните в полную афишу.")}
              </p>
              <Link href={`/${locale}/events`} className="section-link" style={{ marginTop: 20, display: "inline-flex" }}>
                {T("Афишаны ашу", "Открыть афишу")} <DgIcon name="arrow" size={12} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Главное событие — featured (светлая) ═══ */}
      {feature && featureChip && (
        <section className="section section--light" id="afisha">
          <div className="dg-wrap">
            <div className="section-head">
              <div className="section-bar">
                <div className="tag">— {T("Басты оқиға", "Главное событие")} —</div>
                <h2 className="h2" dangerouslySetInnerHTML={{ __html: T("Маусымның <strong>басты</strong> оқиғасы", "Главное <strong>событие</strong> сезона") }} />
              </div>
              <Link href={`/${locale}/events`} className="section-link">
                {T("Барлық афишалар", "Вся афиша")} <DgIcon name="arrow" size={12} />
              </Link>
            </div>

            <div className="feature-wrap">
              <Link href={`/${locale}/events/${feature.id}`} className="feature">
                <div className="feature-media">
                  <Image src={eventImage(feature.image_url, feature.event_type)} alt={titleOf(feature)} fill sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
                <div className="feature-body">
                  <div className="feature-eyebrow">{T("«Арман» халық ансамблі", "Народный ансамбль «Арман»")}</div>
                  <h3 className="feature-title">{titleOf(feature)}</h3>
                  <ul className="feature-meta">
                    <li>
                      <span className="lab"><DgIcon name="calendar" size={14} /> {T("Күні мен уақыты", "Дата и время")}</span>
                      <span className="val">{parseInt(featureChip.d, 10)} {(locale === "kk" ? MONTHS_KK : MONTHS_RU)[featureParts!.month]} {featureParts!.year}, {featureChip.time}</span>
                    </li>
                    <li>
                      <span className="lab"><DgIcon name="pin" size={14} /> {T("Орны", "Место")}</span>
                      <span className="val">{localizeVenue(feature.location, locale, hallPairs)}</span>
                    </li>
                    <li>
                      <span className="lab"><DgIcon name="coin" size={14} /> {T("Бағасы", "Стоимость")}</span>
                      <span className="val price">{T("Тегін", "Бесплатно")}</span>
                    </li>
                  </ul>
                  <span className="feature-cta">
                    {T("Толығырақ", "Подробнее")} <DgIcon name="arrow" size={12} />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Афиша — ближайшие события (светлая) ═══ */}
      {posters.length > 0 && (
        <section className="section section--light" id="upcoming">
          <div className="dg-wrap">
            <div className="section-head">
              <div className="section-bar">
                <div className="tag">— {T("Афиша", "Афиша")} —</div>
                <h2 className="h2" dangerouslySetInnerHTML={{ __html: T("Жақын арадағы <strong>іс-шаралар</strong>", "Ближайшие <strong>мероприятия</strong>") }} />
              </div>
              <Link href={`/${locale}/events`} className="section-link">
                {T("Барлық афишалар", "Вся афиша")} <DgIcon name="arrow" size={12} />
              </Link>
            </div>

            <div className="posters">
              {posters.map((e) => (
                <Link href={`/${locale}/events/${e.id}`} className="poster" key={e.id}>
                  <div className="poster-media">
                    <Image src={eventImage(e.image_url, e.event_type)} alt={titleOf(e)} fill sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>
                  <h3 className="poster-title">{titleOf(e)}</h3>
                  <ul className="poster-meta">
                    <li><DgIcon name="calendar" size={13} /> {posterDate(e)}</li>
                    <li><DgIcon name="coin" size={13} /> <span className="price">{T("Тегін", "Бесплатно")}</span></li>
                  </ul>
                  <span className="poster-cta">
                    {T("Толығырақ", "Подробнее")} <DgIcon name="arrow" size={11} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Творческие составы — 6 из 22 (светлая) ═══ */}
      <section className="section section--light" id="creative">
        <div className="dg-wrap">
          <div className="section-head">
            <div className="section-bar">
              <div className="tag">— {T("22 ұжым", "22 коллектива")} —</div>
              <h2 className="h2" dangerouslySetInnerHTML={{ __html: T("<strong>Сарайдың</strong> шығармашылық ұжымдары", "Творческие составы <strong>Дворца</strong>") }} />
            </div>
            <Link href={`/${locale}/clubs`} className="section-link">
              {T("Барлық ұжымдар", "Все составы")} <DgIcon name="arrow" size={12} />
            </Link>
          </div>
        </div>

        <div className="dg-wrap">
          <div className="coll-strip-wrap">
            <div className="coll-strip">
              {collectives.map((c) => (
                <Link href={`/${locale}/clubs`} className="coll-card" key={c.name}>
                  <div className="coll-card-media">
                    <Image src={c.photo} alt={c.name} fill sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>
                  <div className="name">{c.name}</div>
                  <div className="since">{c.since}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Кружки — 8 направлений (светлая) ═══ */}
      <section className="section section--light" id="circles-home">
        <div className="dg-wrap">
          <div className="section-head">
            <div className="section-bar">
              <div className="tag">— {T("Үйірмелер мен студиялар", "Кружки и студии")} —</div>
              <h2 className="h2" dangerouslySetInnerHTML={{ __html: T("Сегіз бағыт — <strong>барлық жасқа</strong>", "Восемь направлений <strong>для всех возрастов</strong>") }} />
            </div>
            <Link href={`/${locale}/clubs`} className="section-link">
              {T("Барлық үйірмелер", "Все кружки")} <DgIcon name="arrow" size={12} />
            </Link>
          </div>

          <div className="circles">
            {circles.map((c) => (
              <Link href={`/${locale}/clubs?cat=${c.id}`} className="circle-item" key={c.id}>
                <DgIcon name={c.icon} size={36} stroke={1.2} />
                <div className="label">{c.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Аренда залов — teaser (светлая) ═══ */}
      {halls.length > 0 && (
        <section className="section section--light" id="rent">
          <div className="dg-wrap">
            <div className="section-head">
              <div className="section-bar">
                <div className="tag">— {T("Залдарды жалға алу", "Аренда залов")} —</div>
                <h2 className="h2" dangerouslySetInnerHTML={{ __html: T("Іс-шараңызға арналған <strong>залдар</strong>", "Залы для <strong>вашего события</strong>") }} />
              </div>
              <Link href={`/${locale}/rent`} className="section-link">
                {T("Барлық залдар", "Все залы")} <DgIcon name="arrow" size={12} />
              </Link>
            </div>

            <div className="halls-grid">
              {halls.map((h) => {
                const name = getLocalizedField(h as unknown as Record<string, unknown>, "name", locale);
                const desc = getLocalizedField(h as unknown as Record<string, unknown>, "description", locale);
                return (
                  <Link key={h.slug} href={`/${locale}/rent/${h.slug}`} className="hall">
                    <div className="hall-media">
                      <Image src={HALL_PHOTO[h.slug] ?? "/photos/dvorets-08.webp"} alt={name} fill sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                    <div className="hall-body">
                      <h3 className="hall-title">{name}</h3>
                      <div className="hall-seats">
                        <DgIcon name="users" size={14} /> {h.capacity} {T("орын", "мест")}
                      </div>
                      {desc && <p className="hall-desc">{desc}</p>}
                      <div className="hall-foot">
                        <span className="section-link">
                          {T("Толығырақ", "Подробнее")} <DgIcon name="arrow" size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ О дворце (светлая) ═══ */}
      <section className="section section--light" id="about">
        <div className="dg-wrap">
          <div className="about-grid">
            <div className="about-photo">
              <Image src="/photos/og-cover.jpg" alt={T("Тау-кеншілер сарайының ғимараты", "Здание Дворца горняков")} fill sizes="(max-width: 768px) 100vw, 45vw" />
              <div className="about-photo-tag">{T("Сәтбаев · 1974", "Сатпаев · 1974")}</div>
            </div>

            <div className="about-text">
              <div className="section-bar">
                <div className="tag">— {T("Сарай туралы", "О дворце")} —</div>
                <h2 className="h2" dangerouslySetInnerHTML={{ __html: T("Сәтбаев қаласының <strong>басты</strong> мәдени үйі", "<strong>Главный</strong> культурный дом города Сатпаев") }} />
              </div>
              <p style={{ marginTop: 28 }}>
                <strong>{T("Ш. Ділдебаев атындағы Тау-кеншілер сарайы", "Дворец горняков им. Ш. Дильдебаева")}</strong>
                {T(
                  " — Ұлытау өңірінің басты мәдени институты. 1974 жылы «Байқоңыр» кинотеатры ретінде ашылды. 2000 жылы күрделі жөндеуден кейін Тау-кеншілер сарайы болып аталды. 2019 жылдан бері — Ұлытау облысы мәдениет басқармасының КГКП.",
                  " — главный культурный институт Улытауского региона. Открыт в 1974 году как кинотеатр «Байконыр». В 2000-м после капитального ремонта переименован во Дворец горняков. С 2019-го — КГКП управления культуры области Улытау."
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

              <div style={{ marginTop: 32 }}>
                <Link href={`/${locale}/about`} className="section-link">
                  {T("Тарих туралы толығырақ", "Подробнее об истории")} <DgIcon name="arrow" size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Новости (светлая) — только если есть опубликованные ═══ */}
      {news.length > 0 && (
        <section className="section section--light" id="news">
          <div className="dg-wrap">
            <div className="section-head">
              <div className="section-bar">
                <div className="tag">— {T("Жаңалықтар", "Новости")} —</div>
                <h2 className="h2" dangerouslySetInnerHTML={{ __html: T("Сарайдың <strong>соңғы</strong> жаңалықтары", "Последние <strong>новости</strong> Дворца") }} />
              </div>
              <Link href={`/${locale}/news`} className="section-link">
                {T("Барлық жаңалықтар", "Все новости")} <DgIcon name="arrow" size={12} />
              </Link>
            </div>

            <div className="news-grid">
              {news.map((n) => {
                const title = getLocalizedField(n as unknown as Record<string, unknown>, "title", locale);
                const excerpt = getLocalizedField(n as unknown as Record<string, unknown>, "excerpt", locale);
                return (
                  <Link key={n.id} href={`/${locale}/news/${n.slug}`} className="news-item">
                    <div className="news-media">
                      <Image src={n.image_url ?? "/photos/dvorets-01.webp"} alt={title} fill sizes="(max-width: 768px) 50vw, 25vw" />
                    </div>
                    <p className="news-date">{formatNewsDate(n.published_at, locale)}</p>
                    <h3 className="news-title">{title}</h3>
                    {excerpt && <p className="news-excerpt">{excerpt}</p>}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Контакты + карта (тёмная, закрывающая) ═══ */}
      <section className="section" id="contacts">
        <div className="dg-wrap">
          <div className="section-head">
            <div className="section-bar">
              <div className="tag">— {T("Байланыс", "Контакты")} —</div>
              <h2 className="h2" dangerouslySetInnerHTML={{ __html: T("Бізді <strong>қалай табуға</strong> болады", "Как нас <strong>найти</strong>") }} />
            </div>
            <Link href={`/${locale}/about#contacts`} className="section-link">
              {T("Толық байланыс", "Все контакты")} <DgIcon name="arrow" size={12} />
            </Link>
          </div>

          <div className="contact-grid" style={{ marginTop: 32 }}>
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

            <div className="contact-map">
              <iframe
                src={mapSrc}
                title={T("Картадағы орналасуы", "Расположение на карте")}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
