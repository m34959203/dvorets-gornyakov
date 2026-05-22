import Link from "next/link";
import { isValidLocale, type Locale, getLocalizedField } from "@/lib/i18n";
import { getMany } from "@/lib/db";
import { almatyParts } from "@/lib/utils";
import { eventImage } from "@/lib/event-image";
import DgIcon from "@/components/layout/DgIcon";

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

const MONTHS_KK = ["қаң.", "ақп.", "нау.", "сәу.", "мам.", "мау.", "шіл.", "там.", "қыр.", "қаз.", "қар.", "жел."];
const MONTHS_RU = ["янв.", "фев.", "мар.", "апр.", "мая", "июн.", "июл.", "авг.", "сен.", "окт.", "ноя.", "дек."];
const MONTHS_KK_LONG = ["Қаңтар", "Ақпан", "Наурыз", "Сәуір", "Мамыр", "Маусым", "Шілде", "Тамыз", "Қыркүйек", "Қазан", "Қараша", "Желтоқсан"];
const MONTHS_RU_LONG = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const WEEKDAYS_KK = ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"];
const WEEKDAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const COLL_PHOTOS = [
  "/photos/dvorets-07.webp", "/photos/dvorets-11.webp", "/photos/dvorets-05.webp",
  "/photos/dvorets-09-1.webp", "/photos/dvorets-04.webp", "/photos/dvorets-03.webp",
  "/photos/dvorets-13.webp", "/photos/dvorets-08.webp", "/photos/dvorets-10.webp",
  "/photos/dvorets-06.webp", "/photos/dvorets-02.webp", "/photos/dvorets-12.webp",
];

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
  const events = await safe<EventRow>(
    getMany<EventRow>(
      `SELECT * FROM events WHERE status IN ('upcoming','ongoing') ORDER BY start_date ASC LIMIT 18`
    )
  );
  return { events: events.length ? events : getDemoEvents(locale) };
}

function getDemoEvents(locale: Locale): EventRow[] {
  const base = [
    { d: "2026-03-12T19:00", t_kk: "Концерт «Көктем әуені»", t_ru: "Концерт «Мелодии весны»", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-03-15T18:00", t_kk: "«Тұмар» хореографиялық қойылым", t_ru: "Хореографическая постановка «Тумар»", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-03-16T18:00", t_kk: "«Абай жолы» спектаклі", t_ru: "Спектакль «Путь Абая»", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "theater" },
    { d: "2026-03-17T11:00", t_kk: "Қыш илеу шеберлік сабағы", t_ru: "Мастер-класс по гончарному делу", h_kk: "Студия №3", h_ru: "Студия №3", type: "workshop" },
    { d: "2026-03-18T17:00", t_kk: "Балалар билері «Жұлдызай»", t_ru: "Детский танец «Жулдызай»", h_kk: "Камералық", h_ru: "Камерный", type: "concert" },
    { d: "2026-03-19T18:30", t_kk: "Айтыс — Арқа айтысы", t_ru: "Айтыс — состязание акынов", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-03-20T14:00", t_kk: "«Менің Сатпаев» сурет көрмесі", t_ru: "Выставка «Мой Сатпаев»", h_kk: "Фойе", h_ru: "Фойе", type: "exhibition" },
    { d: "2026-03-22T18:00", t_kk: "«Наурыз думан» — қала концерті", t_ru: "Городской концерт «Наурыз»", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-03-24T12:00", t_kk: "Балалар театры «Қарлығаш»", t_ru: "Детский театр «Карлыгаш»", h_kk: "Камералық", h_ru: "Камерный", type: "theater" },
    { d: "2026-03-26T17:00", t_kk: "Жас әртістер байқауы", t_ru: "Конкурс юных артистов", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
    { d: "2026-03-29T19:00", t_kk: "Қазақстан даусы — финал", t_ru: "Голос Казахстана — финал", h_kk: "Үлкен зал", h_ru: "Большой зал", type: "concert" },
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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const { events } = await load(locale);
  const titleOf = (e: EventRow) =>
    getLocalizedField(e as unknown as Record<string, unknown>, "title", locale);

  // ── Расписание: список ближайших + дни-события для календаря ──
  const scheduleItems = events.slice(0, 8).map((e) => {
    const chip = formatDateChip(e.start_date, locale);
    return { id: e.id, d: parseInt(chip.d, 10), m: chip.m, wd: chip.wd, title: titleOf(e), time: chip.time, hall: e.location };
  });
  const eventDays = new Set(events.map((e) => almatyParts(e.start_date).day));
  const refDate = events.length ? events[0].start_date : new Date().toISOString();
  const refParts = almatyParts(refDate);
  const monthIdx = refParts.month;
  const yearLabel = refParts.year;
  const monthName = (locale === "kk" ? MONTHS_KK_LONG : MONTHS_RU_LONG)[monthIdx];
  const startWeekday = ((new Date(yearLabel, monthIdx, 1).getDay() + 6) % 7);
  const daysInMonth = new Date(yearLabel, monthIdx + 1, 0).getDate();
  const nowParts = almatyParts(new Date());
  const todayDay = nowParts.month === monthIdx && nowParts.year === yearLabel ? nowParts.day : -1;

  // Календарные ячейки (6×7)
  const calCells: Array<{ d: number; dim?: boolean; today?: boolean; event?: boolean }> = [];
  const prevMonthDays = new Date(yearLabel, monthIdx, 0).getDate();
  for (let i = startWeekday - 1; i >= 0; i--) calCells.push({ d: prevMonthDays - i, dim: true });
  for (let d = 1; d <= daysInMonth; d++) calCells.push({ d, today: d === todayDay, event: eventDays.has(d) });
  let nx = 1;
  while (calCells.length < 42) calCells.push({ d: nx++, dim: true });

  // ── Featured (первое событие) + сетка афиш (следующие 8) ──
  const feature = events[0];
  const featureChip = feature ? formatDateChip(feature.start_date, locale) : null;
  const posters = events.slice(1, 9);

  // ── Творческие составы ──
  const collectives: Array<{ name: string; since: string }> = [
    { name: T("«Арман» халық ансамблі", "Народный ансамбль «Арман»"), since: T("1975 ж.", "С 1975 г.") },
    { name: T("Хореография", "Хореография"), since: T("1980 ж.", "С 1980 г.") },
    { name: T("Вокал студиясы", "Вокальная студия"), since: T("1985 ж.", "С 1985 г.") },
    { name: T("Театр студиясы", "Театральная студия"), since: T("1978 ж.", "С 1978 г.") },
    { name: T("Қобыз ансамблі", "Кобыз ансамбль"), since: T("1990 ж.", "С 1990 г.") },
    { name: T("Домбыра ансамблі", "Домбра ансамбль"), since: T("1976 ж.", "С 1976 г.") },
    { name: T("Халық хоры", "Народный хор"), since: T("1974 ж.", "С 1974 г.") },
    { name: T("Эстрада студиясы", "Эстрадная студия"), since: T("2000 ж.", "С 2000 г.") },
    { name: T("Бал билері", "Бальные танцы"), since: T("1995 ж.", "С 1995 г.") },
    { name: T("Заманауи би", "Современный танец"), since: T("2005 ж.", "С 2005 г.") },
    { name: T("Көркем сөз студиясы", "Студия художественного слова"), since: T("1982 ж.", "С 1982 г.") },
    { name: T("Балалар фольклоры", "Детский фольклорный"), since: T("1998 ж.", "С 1998 г.") },
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
    return `${parseInt(c.d, 10)} ${(locale === "kk" ? MONTHS_KK : MONTHS_RU)[almatyParts(e.start_date).month]} ${yearLabel}, ${c.time}`;
  };

  return (
    <div className="dg-home">
      <a href="#schedule" className="dg-skip-link">{T("Мазмұнға өту", "Перейти к содержимому")}</a>

      {/* ═══ Hero ═══ */}
      <section className="hero" id="home">
        <img className="hero-photo" src="/hero/hero.jpg" alt="" />
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-inner">
          <h1 className="hero-h1">
            {T("Сүйікті әртістеріңізді ", "Встречайте своих любимых артистов ")}
            <strong>{T("ең үздік залда", "в лучшем зале")}</strong>
            {T(" қарсы алыңыз — Ұлытау өңірінде", " Улытауского региона")}
          </h1>
        </div>
        <a href="#schedule" className="hero-scroll" aria-label={T("Төмен айналдыру", "Прокрутить вниз")}>
          <div className="hero-mouse" />
          <span>{T("Айналдыру", "Прокрутить")}</span>
        </a>
      </section>

      {/* ═══ Расписание на месяц (тёмная) ═══ */}
      <section className="section" id="schedule">
        <div className="dg-wrap">
          <div className="section-head">
            <div className="section-bar">
              <div className="tag">— {T("Айлық бағдарлама", "Расписание на месяц")} —</div>
              <h2 className="h2">{T("Жақын арадағы оқиғалар", "Ближайшие события")}</h2>
            </div>
            <Link href={`/${locale}/events`} className="section-link">
              {T("Барлық афиша", "Вся афиша")} <DgIcon name="arrow" size={12} />
            </Link>
          </div>

          <div className="sched-grid-2">
            <div className="sched-panel">
              <div className="sched-phead">
                <span className="lab">{T("Айдың афишасы", "Афиша месяца")}</span>
                <span className="count"><em>{events.length}</em> {T("оқиға", "событий")}</span>
              </div>
              {scheduleItems.length > 0 ? (
                <ul className="sched-list">
                  {scheduleItems.map((s) => (
                    <li className="sched-item" key={s.id}>
                      <Link href={`/${locale}/events/${s.id}`}>
                        <span className="sched-when">
                          <span className="d">{s.d}</span>
                          <span className="m">{s.m}</span>
                        </span>
                        <span className="sched-info">
                          <span className="s-title">{s.title}</span>
                          <span className="s-meta">
                            <span>{s.time}</span>
                            <span className="sep">·</span>
                            <span>{s.hall}</span>
                          </span>
                        </span>
                        <span className="sched-free">{T("Тегін", "Бесплатно")}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="sched-empty">
                  <DgIcon name="calendar" size={32} stroke={1.1} />
                  <p>{T("Жақын арада жоспарланған оқиғалар жоқ", "Ближайших событий пока нет")}</p>
                  <Link href={`/${locale}/events`} className="section-link">
                    {T("Бүкіл афишаны қарау", "Смотреть всю афишу")} <DgIcon name="arrow" size={12} />
                  </Link>
                </div>
              )}
            </div>

            {/* Календарь */}
            <aside className="cal" aria-label={`${monthName} ${yearLabel}`}>
              <div className="cal-head">
                <div>
                  <div className="cal-month">{monthName}</div>
                  <div className="cal-year" style={{ marginTop: 4 }}>{yearLabel}</div>
                </div>
                <div className="cal-nav">
                  <button aria-label={T("Алдыңғы ай", "Предыдущий месяц")}><DgIcon name="chev-l" size={14} /></button>
                  <button aria-label={T("Келесі ай", "Следующий месяц")}><DgIcon name="chev-r" size={14} /></button>
                </div>
              </div>
              <div className="cal-grid" role="grid">
                {(locale === "kk" ? WEEKDAYS_KK : WEEKDAYS_RU).map((d) => (
                  <div key={d} className="cal-dow">{d}</div>
                ))}
                {calCells.map((c, i) => (
                  <div
                    key={i}
                    role="gridcell"
                    className={"cal-cell" + (c.dim ? " dim" : "") + (c.today ? " today" : "") + (c.event ? " event" : "")}
                  >
                    {c.d}
                  </div>
                ))}
              </div>
              <div className="cal-legend">
                <span><span className="sw" style={{ boxShadow: "inset 0 0 0 1px var(--dg-accent)" }} />{T("Оқиға", "Событие")}</span>
                <span><span className="sw" style={{ background: "rgba(255,255,255,0.18)" }} />{T("Өтті", "Прошло")}</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ═══ Featured «Арман» (светлая) ═══ */}
      {feature && featureChip && (
        <section className="section section--light" id="arman">
          <div className="dg-wrap">
            <div className="section-head">
              <div className="section-bar">
                <div className="tag">— {T("Халық ансамблі", "Народный ансамбль")} —</div>
                <h2 className="h2" dangerouslySetInnerHTML={{ __html: T("Алдағы <strong>«Арман»</strong> іс-шаралары", "Предстоящие мероприятия <strong>«Арман»</strong>") }} />
              </div>
              <Link href={`/${locale}/events`} className="section-link">
                {T("Барлық афиша", "Все афиши")} <DgIcon name="arrow" size={12} />
              </Link>
            </div>

            <div className="feature-wrap">
              <button className="feature-side-arrow l" aria-label={T("Артқа", "Назад")}><DgIcon name="chev-l" size={18} /></button>
              <div className="feature">
                <div className="feature-media">
                  <img src={eventImage(feature.image_url, feature.event_type)} alt={titleOf(feature)} />
                </div>
                <div className="feature-body">
                  <div className="feature-eyebrow">{T("«Арман» халық ансамблі", "Народный ансамбль «Арман»")}</div>
                  <h3 className="feature-title">{titleOf(feature)}</h3>
                  <ul className="feature-meta">
                    <li>
                      <span className="lab"><DgIcon name="calendar" size={14} /> {T("Күні мен уақыты", "Дата и время")}</span>
                      <span className="val">{parseInt(featureChip.d, 10)} {(locale === "kk" ? MONTHS_KK : MONTHS_RU)[monthIdx]} {yearLabel}, {featureChip.time}</span>
                    </li>
                    <li>
                      <span className="lab"><DgIcon name="pin" size={14} /> {T("Орны", "Место")}</span>
                      <span className="val">{feature.location}</span>
                    </li>
                    <li>
                      <span className="lab"><DgIcon name="coin" size={14} /> {T("Бағасы", "Стоимость")}</span>
                      <span className="val price">{T("Тегін", "Бесплатно")}</span>
                    </li>
                  </ul>
                  <Link href={`/${locale}/events/${feature.id}`} className="feature-cta">
                    {T("Толығырақ", "Подробнее")} <DgIcon name="arrow" size={12} />
                  </Link>
                </div>
              </div>
              <button className="feature-side-arrow r" aria-label={T("Алға", "Вперёд")}><DgIcon name="chev-r" size={18} /></button>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Сетка афиш (светлая) ═══ */}
      {posters.length > 0 && (
        <section className="section section--light" id="afisha">
          <div className="dg-wrap">
            <div className="section-head">
              <div className="section-bar">
                <div className="tag">— {T("Афиша", "Афиша")} —</div>
                <h2 className="h2" dangerouslySetInnerHTML={{ __html: T("<strong>Тау-кеншілер сарайының</strong> концерт залындағы іс-шаралар", "Предстоящие мероприятия в концертном зале <strong>Дворца горняков</strong>") }} />
              </div>
              <Link href={`/${locale}/events`} className="section-link">
                {T("Барлық афиша", "Все афиши")} <DgIcon name="arrow" size={12} />
              </Link>
            </div>

            <div className="posters">
              {posters.map((e) => (
                <article className="poster" key={e.id}>
                  <div className="poster-media">
                    <img src={eventImage(e.image_url, e.event_type)} alt={titleOf(e)} />
                  </div>
                  <h3 className="poster-title">{titleOf(e)}</h3>
                  <ul className="poster-meta">
                    <li><DgIcon name="calendar" size={13} /> {posterDate(e)}</li>
                    <li><DgIcon name="coin" size={13} /> <span className="price">{T("Тегін", "Бесплатно")}</span></li>
                  </ul>
                  <Link href={`/${locale}/events/${e.id}`} className="poster-cta">
                    {T("Толығырақ", "Подробнее")} <DgIcon name="arrow" size={11} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Творческие составы (светлая) ═══ */}
      <section className="section section--light" id="creative">
        <div className="dg-wrap">
          <div className="section-head">
            <div className="section-bar">
              <div className="tag">— {T("22 ұжым", "22 коллектива")} —</div>
              <h2 className="h2" dangerouslySetInnerHTML={{ __html: T("<strong>Сарайдың</strong> шығармашылық ұжымдары", "Творческие составы <strong>Дворца</strong>") }} />
            </div>
            <Link href={`/${locale}/clubs`} className="section-link">
              {T("Барлық ұжым", "Все составы")} <DgIcon name="arrow" size={12} />
            </Link>
          </div>
        </div>

        <div className="dg-wrap">
          <div className="coll-strip-wrap">
            <div className="coll-strip">
              {collectives.map((c, i) => (
                <Link href={`/${locale}/clubs`} className="coll-card" key={c.name}>
                  <div className="coll-card-media">
                    <img src={COLL_PHOTOS[i % COLL_PHOTOS.length]} alt={c.name} />
                  </div>
                  <div className="name">{c.name}</div>
                  <div className="since">{c.since}</div>
                </Link>
              ))}
            </div>
          </div>
          <div className="coll-progress">
            <div className="coll-count" dangerouslySetInnerHTML={{ __html: T("<strong>12</strong> / <strong>22</strong> көрсетілді", "Показано <strong>12</strong> из <strong>22</strong>") }} />
            <div className="sched-arrows">
              <button className="arrow-btn" aria-label={T("Артқа", "Назад")}><DgIcon name="chev-l" size={16} /></button>
              <button className="arrow-btn" aria-label={T("Алға", "Вперёд")}><DgIcon name="chev-r" size={16} /></button>
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
              {T("Барлық үйірме", "Все кружки")} <DgIcon name="arrow" size={12} />
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

          <div className="circles-cta">
            <Link href={`/${locale}/clubs`} className="section-link">
              {T("Барлық үйірме", "Все кружки")} <DgIcon name="arrow" size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ О дворце (светлая) ═══ */}
      <section className="section section--light" id="about">
        <div className="dg-wrap">
          <div className="about-grid">
            <div className="about-photo">
              <img src="/photos/dvorets-01.webp" alt={T("Тау-кеншілер сарайының ғимараты", "Здание Дворца горняков")} />
              <div className="about-photo-tag">Сатпаев · 1974</div>
            </div>

            <div className="about-text">
              <div className="section-bar">
                <div className="tag">— {T("Сарай туралы", "О дворце")} —</div>
                <h2 className="h2" dangerouslySetInnerHTML={{ __html: T("Ұлытаудың <strong>басты</strong> мәдени үйі", "<strong>Главный</strong> культурный дом Улытау") }} />
              </div>
              <p style={{ marginTop: 28 }}>
                <strong>{T("Ш. Дільдебаев атындағы Тау-кеншілер сарайы", "Дворец горняков им. Ш. Дильдебаева")}</strong>
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

      {/* ═══ Brand wall (тёмная) ═══ */}
      <section className="brand-wall" aria-label="Дворец горняков · Сатпаев">
        <img className="hero-photo" src="/hero/hero.jpg" alt="" />
        <div className="hero-vignette" aria-hidden="true" />
        <div className="brand-wall-inner">
          <div className="brand-wall-eq" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span /><span />
          </div>
          <h2 className="brand-wall-name">Dvorets Gornyakov</h2>
          <div className="brand-wall-sub">{T("Сатпаев · Тау-кеншілер сарайы", "Сатпаев · Дворец горняков")}</div>
        </div>
      </section>
    </div>
  );
}
