import Link from "next/link";
import { isValidLocale, type Locale, getLocalizedField } from "@/lib/i18n";
import { getMany } from "@/lib/db";
import { almatyParts } from "@/lib/utils";
import { eventImage } from "@/lib/event-image";
import EtnoHero from "@/components/features/EtnoHero";
import EtnoSchedule from "@/components/features/EtnoSchedule";
import PosterCard, { type Poster } from "@/components/features/PosterCard";

export const dynamic = "force-dynamic";

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
  category: string;
  published_at: string;
}

const MONTHS_KK = ["қаң.", "ақп.", "нау.", "сәу.", "мам.", "мау.", "шіл.", "там.", "қыр.", "қаз.", "қар.", "жел."];
const MONTHS_RU = ["янв.", "фев.", "мар.", "апр.", "мая", "июн.", "июл.", "авг.", "сен.", "окт.", "ноя.", "дек."];
const MONTHS_KK_LONG = ["Қаңтар", "Ақпан", "Наурыз", "Сәуір", "Мамыр", "Маусым", "Шілде", "Тамыз", "Қыркүйек", "Қазан", "Қараша", "Желтоқсан"];
const MONTHS_RU_LONG = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const WEEKDAYS_KK = ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"];
const WEEKDAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

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

async function load(locale: Locale) {
  async function safe<T>(q: Promise<T[]>): Promise<T[]> {
    try {
      return await q;
    } catch {
      return [];
    }
  }
  const [events, news] = await Promise.all([
    safe<EventRow>(
      getMany<EventRow>(
        `SELECT * FROM events WHERE status IN ('upcoming','ongoing') ORDER BY start_date ASC LIMIT 18`
      )
    ),
    safe<NewsRow>(
      getMany<NewsRow>(
        `SELECT * FROM news WHERE status = 'published' ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT 4`
      )
    ),
  ]);

  return {
    events: events.length ? events : getDemoEvents(locale),
    news: news.length ? news : getDemoNews(locale),
  };
}

function getDemoEvents(locale: Locale): EventRow[] {
  // 18 событий, разнесены по дате (наурыз–сәуір 2026)
  const base = [
    { d: "2026-03-12T19:00", t_kk: "Концерт «Көктем әуені»", t_ru: "Концерт «Мелодии весны»", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-03-14T19:00", t_kk: "Симфониялық оркестр", t_ru: "Симфонический оркестр", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-03-15T18:00", t_kk: "«Тұмар» хореографиялық қойылым", t_ru: "Хореографическая постановка «Тумар»", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-03-16T18:00", t_kk: "«Абай жолы» спектаклі", t_ru: "Спектакль «Путь Абая»", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "theater" },
    { d: "2026-03-17T11:00", t_kk: "Қыш илеу шеберлік сабағы", t_ru: "Мастер-класс по гончарному делу", h_kk: "Студия №3", h_ru: "Студия №3", type: "workshop" },
    { d: "2026-03-18T17:00", t_kk: "Балалар билері «Жұлдызай»", t_ru: "Детский танец «Жулдызай»", h_kk: "Камералық", h_ru: "Камерный", type: "concert" },
    { d: "2026-03-19T18:30", t_kk: "Айтыс — Арқа айтысы", t_ru: "Айтыс — состязание акынов", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-03-20T14:00", t_kk: "«Менің Сатпаев» сурет көрмесі", t_ru: "Выставка «Мой Сатпаев»", h_kk: "Фойе", h_ru: "Фойе", type: "exhibition" },
    { d: "2026-03-22T18:00", t_kk: "«Наурыз думан» — қала концерті", t_ru: "Городской концерт «Наурыз»", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-03-22T19:30", t_kk: "Жыл қорытынды концерті", t_ru: "Итоговый концерт года", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-03-24T12:00", t_kk: "Балалар театры «Қарлығаш»", t_ru: "Детский театр «Карлыгаш»", h_kk: "Камералық", h_ru: "Камерный", type: "theater" },
    { d: "2026-03-25T18:30", t_kk: "Шығыс билері кеші", t_ru: "Вечер восточных танцев", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-03-26T17:00", t_kk: "Жас әртістер байқауы", t_ru: "Конкурс юных артистов", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-03-28T19:00", t_kk: "«Қара жорға» этно-кеш", t_ru: "Этно-вечер «Қара жорға»", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-03-29T19:00", t_kk: "Қазақстан даусы — финал", t_ru: "Голос Казахстана — финал", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-04-01T16:00", t_kk: "Кіші топ есеп беруі", t_ru: "Отчётный концерт младшей группы", h_kk: "Камералық", h_ru: "Камерный", type: "concert" },
    { d: "2026-04-02T19:00", t_kk: "Опера кеші — Абылай хан", t_ru: "Оперный вечер — Абылай хан", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-04-05T19:00", t_kk: "Көктем фестивалі — гала", t_ru: "Гала-концерт фестиваля «Весна»", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
  ];
  return base.map((b, i) => ({
    id: String(i + 1),
    title_kk: b.t_kk,
    title_ru: b.t_ru,
    description_kk: "",
    description_ru: "",
    image_url: null,
    event_type: b.type,
    start_date: b.d,
    location: locale === "kk" ? b.h_kk : b.h_ru,
  }));
}

function getDemoNews(locale: Locale): NewsRow[] {
  return [
    {
      id: "n1",
      slug: "arman-grand-prix",
      title_kk: "«Арман» республикалық байқауда Гран-при иеленді",
      title_ru: "Ансамбль «Арман» получил Гран-при на республиканском конкурсе",
      excerpt_kk: "Астанада өткен «Жас өркен» байқауында ансамбліміз бас жүлдені жеңіп алды.",
      excerpt_ru: "На конкурсе «Жас өркен» в Астане наш ансамбль взял главный приз.",
      image_url: null,
      category: locale === "kk" ? "Жетістіктер" : "Достижения",
      published_at: "2026-03-20T10:00:00Z",
    },
    {
      id: "n2",
      slug: "new-sound",
      title_kk: "Үлкен залда жаңа дыбыс жүйесі қондырылды",
      title_ru: "В Большом зале установлена новая звуковая система",
      excerpt_kk: "Заманауи Meyer Sound жүйесі орнатылып, концерт сапасы артты.",
      excerpt_ru: "Современная Meyer Sound — концерты теперь звучат иначе.",
      image_url: null,
      category: locale === "kk" ? "Жабдықтау" : "Оснащение",
      published_at: "2026-03-18T10:00:00Z",
    },
    {
      id: "n3",
      slug: "spring-camp",
      title_kk: "Көктемгі шығармашылық лагерь басталды",
      title_ru: "Стартовал весенний творческий лагерь",
      excerpt_kk: "80 балаға арналған тегін шығармашылық лагерь жұмыс істеуде.",
      excerpt_ru: "Бесплатный лагерь на 80 детей — занятия идут.",
      image_url: null,
      category: locale === "kk" ? "Балаларға" : "Детям",
      published_at: "2026-03-15T10:00:00Z",
    },
    {
      id: "n4",
      slug: "kids-art-show",
      title_kk: "Жас суретшілердің көрмесі ашылды",
      title_ru: "Открылась выставка юных художников",
      excerpt_kk: "«Менің Сатпаев» атты балалар сурет көрмесі фойеде ашылды.",
      excerpt_ru: "В фойе открыта выставка детских работ «Мой Сатпаев».",
      image_url: null,
      category: locale === "kk" ? "Көрме" : "Выставка",
      published_at: "2026-03-03T10:00:00Z",
    },
  ];
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const data = await load(locale);

  // Разделение событий по площадке: «Үлкен зал» (Большой зал) vs остальное (Арман и др.)
  const allEvents = data.events;
  const isBigHall = (e: EventRow) => /үлкен|большой|grand/i.test(e.location || "");
  const bigHallEvents = allEvents.filter(isBigHall).slice(0, 8);
  const armanEvents = allEvents.filter((e) => !isBigHall(e)).slice(0, 8);

  const toPoster = (e: EventRow): Poster => {
    const chip = formatDateChip(e.start_date, locale);
    return {
      title: getLocalizedField(e as unknown as Record<string, unknown>, "title", locale),
      date: `${parseInt(chip.d, 10)} ${(locale === "kk" ? MONTHS_KK : MONTHS_RU)[almatyParts(e.start_date).month]}`,
      time: chip.time,
      hall: e.location,
      price: T("Тегін", "Бесплатно"),
      free: true,
      href: `/${locale}/events/${e.id}`,
      image: eventImage(e.image_url, e.event_type),
    };
  };

  // Расписание (4 ближайших события + дни события для календаря)
  const scheduleItems = allEvents.slice(0, 5).map((e) => {
    const chip = formatDateChip(e.start_date, locale);
    return {
      d: chip.d,
      m: chip.m,
      wd: chip.wd,
      title: getLocalizedField(e as unknown as Record<string, unknown>, "title", locale),
      time: chip.time,
      hall: e.location,
      price: T("Тегін", "Бесплатно"),
    };
  });
  const eventDays = Array.from(
    new Set(allEvents.map((e) => almatyParts(e.start_date).day))
  ).sort((a, b) => a - b);
  const monthIdx = scheduleItems.length
    ? almatyParts(allEvents[0].start_date).month
    : almatyParts(new Date()).month;
  const yearLabel = scheduleItems.length
    ? almatyParts(allEvents[0].start_date).year
    : almatyParts(new Date()).year;
  const monthLabel = `${(locale === "kk" ? MONTHS_KK_LONG : MONTHS_RU_LONG)[monthIdx]} ${yearLabel}`;

  // Стартовый weekday (0=пн) для отображаемого месяца
  const firstDay = new Date(yearLabel, monthIdx, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(yearLabel, monthIdx + 1, 0).getDate();

  return (
    <>
      <EtnoHero
        locale={locale}
        slogan={T("Үлытау өңірінің мәдени сарайы", "Культурный дворец Улытауского региона")}
        subline={T("Сатпаев қаласы · 1974 жылдан бері", "г. Сатпаев · с 1974 года")}
      />

      <EtnoSchedule
        locale={locale}
        items={scheduleItems}
        monthLabel={monthLabel}
        eventDays={eventDays}
        startWeekday={startWeekday}
        daysInMonth={daysInMonth}
      />

      {/* Афиши «Арман» */}
      {armanEvents.length > 0 && (
      <section className="etno-posters-section" style={{ background: "#fff" }}>
        <div className="section-kicker">
          <div className="bar" />
          <div>
            <div className="eyebrow">
              {T("Аңсамбль «Арман»", "Ансамбль «Арман»")}
            </div>
            <h2>{T("«Арман» алдағы іс-шаралары", "Ближайшие события «Арман»")}</h2>
          </div>
          <Link
            href={`/${locale}/events`}
            style={{
              marginLeft: "auto",
              color: "var(--emerald)",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              alignSelf: "center",
            }}
            className="hidden md:inline-flex"
          >
            {T("Барлық афишалар →", "Все афиши →")}
          </Link>
        </div>
        <div className="etno-posters-grid">
          {armanEvents.map((e, i) => (
            <PosterCard
              key={e.id}
              p={toPoster(e)}
              idx={i}
              detailsLabel={T("Толығырақ", "Подробнее")}
            />
          ))}
        </div>
      </section>
      )}

      {/* Афиши «Үлкен зал» */}
      {bigHallEvents.length > 0 && (
      <section className="etno-posters-section" style={{ background: "var(--bg-cream)" }}>
        <div className="section-kicker">
          <div className="bar" />
          <div>
            <div className="eyebrow">{T("Үлкен зал", "Большой зал")}</div>
            <h2>{T("Ұлы залдағы концерттер", "Концерты в Большом зале")}</h2>
          </div>
          <Link
            href={`/${locale}/events`}
            style={{
              marginLeft: "auto",
              color: "var(--emerald)",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              alignSelf: "center",
            }}
            className="hidden md:inline-flex"
          >
            {T("Барлық афишалар →", "Все афиши →")}
          </Link>
        </div>
        <div className="etno-posters-grid">
          {bigHallEvents.map((e, i) => (
            <PosterCard
              key={e.id}
              p={toPoster(e)}
              idx={i + 2}
              detailsLabel={T("Толығырақ", "Подробнее")}
            />
          ))}
        </div>
      </section>
      )}

      {/* О дворце */}
      <section
        className="etno-about-band"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%230d7377' stroke-width='0.6' opacity='0.07'><path d='M40 12 C 22 22, 22 50, 40 60 C 58 50, 58 22, 40 12 Z'/></g></svg>\")",
          backgroundPosition: "right -40px center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "400px",
        }}
      >
        <div className="etno-about-band-inner">
          <div className="img-ph" style={{ height: 480, borderRadius: 18 }}>
            <span className="ph-label">[ {T("Дворец горняков · фасад", "Дворец горняков · фасад")} ]</span>
          </div>
          <div>
            <div className="section-kicker" style={{ marginBottom: 24 }}>
              <div className="bar" style={{ height: 64 }} />
              <div>
                <div className="eyebrow">{T("Сарай туралы", "О дворце")}</div>
                <h2 style={{ fontSize: 42 }}>{T("Біздің тарихымыз", "Наша история")}</h2>
              </div>
            </div>
            <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.65, marginBottom: 14 }}>
              {T(
                "1974 жылы қаладағы алғашқы кинотеатр «Байқоңыр» болып ашылды. Бір жылдан кейін атақты «Арман» хореография ансамблі құрылды.",
                "В 1974 году первый кинотеатр города назывался «Байконыр». Через год был создан легендарный хореографический ансамбль «Арман»."
              )}
            </p>
            <p style={{ fontSize: 16, color: "var(--text-mute)", lineHeight: 1.65, marginBottom: 14 }}>
              {T(
                "2000 жылы ғимарат толық қайта жаңартылып, тау-кенші мәдениет сарайына айналды. 2019 жылдан бастап ол ақын-импровизатор Шынболат Дільдебаевтың атымен аталады.",
                "В 2000 году здание было реконструировано и стало Дворцом культуры горняков. С 2019 года он носит имя поэта-импровизатора Шынболата Дильдебаева."
              )}
            </p>
            <p style={{ fontSize: 16, color: "var(--text-mute)", lineHeight: 1.65, marginBottom: 32 }}>
              {T(
                "Бүгін біз КГКП мәртебесімен жұмыс істейтін Сатпаев қаласындағы ең ірі мәдени орталық — 22 ұжым, 758 қатысушы, 3 заманауи зал.",
                "Сегодня мы — крупнейший культурный центр Сатпаева в статусе ГККП: 22 коллектива, 758 участников, 3 современных зала."
              )}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 28,
                marginBottom: 32,
                paddingTop: 24,
                borderTop: "1px solid var(--line)",
              }}
              className="etno-stats-row"
            >
              {[
                { n: "22", l: T("Ұжым", "Коллективов") },
                { n: "758", l: T("Қатысушы", "Участников") },
                { n: "60+", l: T("Жыл", "Лет") },
                { n: "3", l: T("Зал", "Зала") },
              ].map((s) => (
                <div key={s.l}>
                  <div
                    style={{
                      fontFamily: "var(--font-head)",
                      fontSize: 48,
                      fontWeight: 800,
                      letterSpacing: "-0.05em",
                      color: "var(--emerald)",
                      lineHeight: 1,
                    }}
                  >
                    {s.n}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-mute)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginTop: 8,
                    }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
            <Link href={`/${locale}/about`} className="btn btn-primary">
              {T("Толығырақ", "Подробнее")} →
            </Link>
          </div>
        </div>
      </section>

      {/* Новости */}
      <section className="etno-posters-section" style={{ background: "var(--bg-cream)" }}>
        <div className="section-kicker">
          <div className="bar" />
          <div>
            <div className="eyebrow">{T("Жаңалықтар", "Новости")}</div>
            <h2>{T("Соңғы жаңалықтар", "Последние новости")}</h2>
          </div>
          <Link
            href={`/${locale}/news`}
            style={{
              marginLeft: "auto",
              color: "var(--emerald)",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              alignSelf: "center",
            }}
            className="hidden md:inline-flex"
          >
            {T("Барлық жаңалықтар →", "Все новости →")}
          </Link>
        </div>
        <div className="etno-posters-grid">
          {data.news.map((n, i) => {
            const chip = formatDateChip(n.published_at, locale);
            return (
              <article
                key={n.id}
                className="etno-card"
                style={{ display: "flex", flexDirection: "column" }}
              >
                <div
                  className={`img-ph ${i === 1 ? "ochre" : i === 2 ? "cream" : ""}`}
                  style={{ height: 200 }}
                >
                  <span
                    className="ph-label"
                    style={i === 2 ? { color: "rgba(28,28,28,0.45)" } : {}}
                  >
                    {parseInt(chip.d, 10)} {chip.m.toLowerCase()}
                  </span>
                </div>
                <div style={{ padding: 22, display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ fontSize: 17, marginBottom: 10, lineHeight: 1.3 }}>
                    {getLocalizedField(n as unknown as Record<string, unknown>, "title", locale)}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-mute)",
                      lineHeight: 1.55,
                      marginBottom: 16,
                      flex: 1,
                    }}
                  >
                    {getLocalizedField(n as unknown as Record<string, unknown>, "excerpt", locale)}
                  </p>
                  <Link
                    href={`/${locale}/news/${n.slug}`}
                    style={{
                      color: "#a07a1f",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {T("Толығырақ білу →", "Узнать больше →")}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA пара */}
      <section className="etno-cta-pair">
        <div className="etno-cta-pair-grid">
          {/* Изумрудная карточка */}
          <div
            className="etno-cta-card"
            style={{
              background: "linear-gradient(135deg, var(--emerald) 0%, var(--emerald-dark) 100%)",
              color: "var(--text-light)",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -50,
                top: -50,
                opacity: 0.15,
                pointerEvents: "none",
              }}
            >
              <svg width="280" height="280" viewBox="0 0 280 280">
                <path
                  d="M140 30 C 70 50, 70 170, 140 200 C 210 170, 210 50, 140 30 Z"
                  stroke="#d4a843"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle cx="140" cy="115" r="14" fill="#d4a843" />
              </svg>
            </div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "var(--ochre)",
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                {T("Шығармашылық", "Творчество")}
              </div>
              <h3 style={{ color: "var(--text-light)" }}>
                {T("Үйірмелерге жазылу", "Записаться в кружки")}
              </h3>
              <p>
                {T(
                  "22 ұжым, 5 жастан ересектерге дейін. AI-көмекші сізге бағыт таңдауға көмектеседі.",
                  "22 коллектива, от 5 лет до взрослых. AI-помощник подберёт направление."
                )}
              </p>
            </div>
            <Link
              href={`/${locale}/clubs`}
              className="cta-btn"
              style={{ background: "var(--ochre)", color: "var(--text)" }}
            >
              {T("Жазылу →", "Записаться →")}
            </Link>
          </div>

          {/* Охровая карточка */}
          <div
            className="etno-cta-card"
            style={{
              background: "linear-gradient(135deg, var(--ochre) 0%, #b8862a 100%)",
              color: "var(--text)",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -50,
                top: -50,
                opacity: 0.15,
                pointerEvents: "none",
              }}
            >
              <svg width="280" height="280" viewBox="0 0 280 280">
                <path
                  d="M140 30 C 70 50, 70 170, 140 200 C 210 170, 210 50, 140 30 Z"
                  stroke="#1c1c1c"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle cx="140" cy="115" r="14" fill="#1c1c1c" />
              </svg>
            </div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "var(--text)",
                  opacity: 0.7,
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                {T("Залдар", "Залы")}
              </div>
              <h3>{T("Зал жалдау", "Аренда зала")}</h3>
              <p>
                {T(
                  "3 заманауи зал — 40, 120 және 650 орындық. КГКП шеңберінде — тегін.",
                  "3 современных зала — 40, 120 и 650 мест. В рамках ГККП — бесплатно."
                )}
              </p>
            </div>
            <Link
              href={`/${locale}/rent`}
              className="cta-btn"
              style={{ background: "var(--text)", color: "var(--text-light)" }}
            >
              {T("Бронь жасау →", "Забронировать →")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
