import Link from "next/link";
import { getMessages, isValidLocale, type Locale, getLocalizedField } from "@/lib/i18n";
import { getMany } from "@/lib/db";
import HomeHero from "@/components/features/HomeHero";
import NewsCard from "@/components/features/NewsCard";
import ClubCard from "@/components/features/ClubCard";
import HallCard from "@/components/features/HallCard";
import EventCard from "@/components/features/EventCard";
import CalendarStrip from "@/components/features/CalendarStrip";

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

interface ClubRow {
  id: string;
  name_kk: string;
  name_ru: string;
  description_kk: string;
  description_ru: string;
  image_url: string | null;
  age_group: string;
  direction: string;
  instructor_name: string;
}

interface NewsRow {
  id: string;
  slug: string;
  title_kk: string;
  title_ru: string;
  excerpt_kk: string;
  excerpt_ru: string;
  image_url: string | null;
  video_url?: string | null;
  embed_code?: string;
  category: string;
  published_at: string;
}

interface HallRow {
  id: string;
  slug: string;
  name_kk: string;
  name_ru: string;
  description_kk: string;
  description_ru: string;
  capacity: number;
  equipment_kk: string[];
  equipment_ru: string[];
  event_price_from: number;
  photos: { url: string }[];
}

interface BannerRow {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  position: string;
  is_active: boolean;
}

async function load(locale: Locale) {
  async function safe<T>(q: Promise<T[]>): Promise<T[]> {
    try { return await q; } catch { return []; }
  }
  const [events, clubs, news, halls, banners] = await Promise.all([
    safe<EventRow>(getMany<EventRow>(
      `SELECT * FROM events WHERE status IN ('upcoming','ongoing') ORDER BY start_date ASC LIMIT 8`
    )),
    safe<ClubRow>(getMany<ClubRow>(
      `SELECT * FROM clubs WHERE is_active = TRUE ORDER BY name_ru ASC LIMIT 4`
    )),
    safe<NewsRow>(getMany<NewsRow>(
      `SELECT * FROM news WHERE status = 'published' ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT 3`
    )),
    safe<HallRow>(getMany<HallRow>(
      `SELECT * FROM halls WHERE is_active = TRUE ORDER BY sort_order ASC LIMIT 3`
    )),
    safe<BannerRow>(getMany<BannerRow>(
      `SELECT * FROM banners WHERE is_active = TRUE ORDER BY sort_order ASC`
    )),
  ]);

  const demoEvents = getDemoEvents(locale);
  const demoClubs = getDemoClubs();
  const demoNews = getDemoNews(locale);
  const demoHalls = getDemoHalls(locale);

  return {
    events: events.length ? events : demoEvents,
    clubs: clubs.length ? clubs : demoClubs,
    news: news.length ? news : demoNews,
    halls: halls.length ? halls.map((h) => mapHallForCard(h, locale)) : demoHalls,
    banners,
  };
}

function mapHallForCard(h: HallRow, locale: Locale) {
  const features = locale === "kk" ? h.equipment_kk || [] : h.equipment_ru || [];
  const price = h.event_price_from
    ? `${locale === "kk" ? "бастап" : "от"} ${h.event_price_from.toLocaleString("ru-RU")} ₸`
    : "";
  return {
    id: h.id,
    slug: h.slug,
    name: getLocalizedField(h as unknown as Record<string, unknown>, "name", locale),
    seats: h.capacity,
    description: getLocalizedField(h as unknown as Record<string, unknown>, "description", locale),
    features: features.slice(0, 4),
    price,
    image: h.photos?.[0]?.url || "/hero/hero.jpg",
  };
}

function getDemoEvents(locale: Locale): EventRow[] {
  return [
    { id: "1", title_kk: "Наурыз мерекесіне арналған концерт", title_ru: "Симфонический концерт к Наурызу", description_kk: "", description_ru: "", image_url: null, event_type: "concert", start_date: "2026-04-22T18:00:00Z", location: locale === "kk" ? "Негізгі зал" : "Главный зал" },
    { id: "2", title_kk: "Қазақ поэзиясы кеші", title_ru: "Вечер казахской поэзии", description_kk: "", description_ru: "", image_url: null, event_type: "other", start_date: "2026-05-05T19:00:00Z", location: locale === "kk" ? "Камералық зал" : "Камерный зал" },
    { id: "3", title_kk: "Балалар би шеберханасы", title_ru: "Танцевальный мастер-класс для детей", description_kk: "", description_ru: "", image_url: null, event_type: "workshop", start_date: "2026-05-15T14:00:00Z", location: locale === "kk" ? "Репетиция залы" : "Репетиционный" },
    { id: "4", title_kk: "Жас суретшілер көрмесі", title_ru: "Выставка юных художников", description_kk: "", description_ru: "", image_url: null, event_type: "exhibition", start_date: "2026-06-01T10:00:00Z", location: locale === "kk" ? "Галерея" : "Галерея" },
  ];
}

function getDemoClubs(): ClubRow[] {
  return [
    { id: "c1", name_kk: "Вокал студиясы", name_ru: "Вокальная студия", description_kk: "Кәсіби вокал сабақтары", description_ru: "Академический и эстрадный вокал — сольное пение и ансамбль.", image_url: null, age_group: "7-18", direction: "vocal", instructor_name: "Айгүл Серікқызы" },
    { id: "c2", name_kk: "Халық билері", name_ru: "Народные танцы", description_kk: "Қазақ ұлттық билері", description_ru: "Казахские национальные танцы и постановки для фестивалей.", image_url: null, age_group: "5-16", direction: "dance", instructor_name: "Динара Маратқызы" },
    { id: "c3", name_kk: "Бейнелеу өнері", name_ru: "Изобразительное искусство", description_kk: "Сурет, кескіндеме, графика", description_ru: "Рисунок, живопись, графика и основы композиции.", image_url: null, age_group: "6-17", direction: "art", instructor_name: "Бауыржан Нұрланұлы" },
    { id: "c4", name_kk: "Театр студиясы", name_ru: "Театральная студия", description_kk: "Актёрлік шеберлік", description_ru: "Актёрское мастерство, сценическая речь, сценодвижение.", image_url: null, age_group: "8-18", direction: "theater", instructor_name: "Сәуле Бекенқызы" },
  ];
}

function getDemoNews(locale: Locale): NewsRow[] {
  return [
    { id: "n1", slug: "nauryz-2026", title_kk: "Наурыз мерекесіне шақырамыз!", title_ru: "Приглашаем на праздник Наурыз!", excerpt_kk: "Мерекелік іс-шаралар", excerpt_ru: "Во дворце пройдут праздничные мероприятия, посвящённые Наурызу.", image_url: null, category: locale === "kk" ? "Жаңалықтар" : "Новости", published_at: "2026-03-15T10:00:00Z" },
    { id: "n2", slug: "new-clubs-2026", title_kk: "Жаңа оқу жылына жазылу", title_ru: "Запись в кружки на новый сезон", excerpt_kk: "2026-2027 оқу жылы", excerpt_ru: "Открыта запись в 20+ творческих студий на 2026–2027 учебный год.", image_url: null, category: locale === "kk" ? "Үйірмелер" : "Студии", published_at: "2026-03-10T10:00:00Z" },
    { id: "n3", slug: "competition-results", title_kk: "Байқау нәтижелері", title_ru: "Итоги областного конкурса", excerpt_kk: "Облыстық шығармашылық байқау", excerpt_ru: "Опубликованы результаты областного творческого конкурса среди школьников.", image_url: null, category: locale === "kk" ? "Байқау" : "Конкурсы", published_at: "2026-03-05T10:00:00Z" },
  ];
}

function getDemoHalls(locale: Locale) {
  return locale === "kk"
    ? [
        { id: "grand", slug: "grand", name: "Негізгі концерттік зал", seats: 650, description: "Оркестрге, әшекейлі қойылымдарға және ірі мерекелік концерттерге арналған классикалық зал.", features: ["Кәсіби дыбыс пен жарық", "Сахна 12×8 м", "Екі ярус балкон", "Киім ілгіш 400 орынға"], price: "250 000 ₸-ден / күн", image: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1400&q=80" },
        { id: "chamber", slug: "chamber", name: "Камералық зал", seats: 120, description: "Камералық концерттерге, поэзия кештеріне және дөңгелек үстелдерге арналған.", features: ["Акустикалық құрылым", "Stage monitoring", "Конференц-режим", "Киім ілгіш 80 орынға"], price: "80 000 ₸-ден / күн", image: "https://images.unsplash.com/photo-1519683109079-d5f539e1542f?w=1400&q=80" },
        { id: "rehearsal", slug: "rehearsal", name: "Репетиция залы", seats: 40, description: "Репетицияларға, мастер-кластарға және жас ұжымдардың жұмысына арналған.", features: ["Кәсіби айналар", "Балет станоктары", "Линолеум жабын", "Киім ауыстыру бөлмесі"], price: "15 000 ₸-ден / күн", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1400&q=80" },
      ]
    : [
        { id: "grand", slug: "grand", name: "Главный концертный зал", seats: 650, description: "Классический зал для симфонических концертов, балета и масштабных торжественных событий.", features: ["Профессиональный звук и свет", "Сцена 12×8 м", "Два яруса балконов", "Гардероб на 400 мест"], price: "от 250 000 ₸ / день", image: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1400&q=80" },
        { id: "chamber", slug: "chamber", name: "Камерный зал", seats: 120, description: "Камерные концерты, поэтические вечера, круглые столы и мастер-классы.", features: ["Акустическая отделка", "Stage monitoring", "Режим конференции", "Гардероб на 80 мест"], price: "от 80 000 ₸ / день", image: "https://images.unsplash.com/photo-1519683109079-d5f539e1542f?w=1400&q=80" },
        { id: "rehearsal", slug: "rehearsal", name: "Репетиционный зал", seats: 40, description: "Репетиции, мастер-классы и занятия молодых коллективов.", features: ["Профессиональные зеркала", "Балетные станки", "Специальный линолеум", "Гримёрная"], price: "от 15 000 ₸ / день", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1400&q=80" },
      ];
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "ru";
  const messages = getMessages(locale);
  const t = messages.home;

  const data = await load(locale);

  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const heroBanner = data.banners.find((b) => b.position === "hero");

  return (
    <div>
      <HomeHero
        locale={locale}
        title={t.heroTitle}
        headline={locale === "kk" ? "Өнер оянады|Сәтбаевтың жүрегінде" : "Искусство оживает|в сердце Сатпаева"}
        lead={t.heroLead || T(
          "Ш. Ділдебаев атындағы сарай — қаланың басты сахнасы. Классика, қазақ дәстүрі мен жаңа есімдер осы жерде кездеседі.",
          "Дворец культуры горняков им. Ш. Дильдебаева — главная сцена города. Здесь встречаются симфоническая классика, казахская традиция и новые имена."
        )}
        badge={T("1965 жылдан бері · 60 жыл өнерде", "С 1965 года · 60 лет искусству")}
        ctaSchedule={T("Афишаны қарау", "Смотреть афишу")}
        ctaRent={T("Зал жалдау", "Арендовать зал")}
      />

      {/* Banner slot (from admin /admin/banners) */}
      {heroBanner && (
        <section className="bg-white">
          <div className="max-w-[1240px] mx-auto px-7 py-8">
            {heroBanner.link_url ? (
              <a href={heroBanner.link_url} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroBanner.image_url} alt={heroBanner.title}
                     className="w-full h-auto rounded-2xl shadow-sm" />
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroBanner.image_url} alt={heroBanner.title}
                   className="w-full h-auto rounded-2xl shadow-sm" />
            )}
          </div>
        </section>
      )}

      <CalendarStrip locale={locale} />

      {/* Events grid */}
      <section className="py-20 bg-[color:var(--cream)]">
        <div className="max-w-[1240px] mx-auto px-7">
          <div className="flex items-end justify-between gap-10 mb-11">
            <div>
              <div className="eyebrow">{T("Афиша", "Афиша")}</div>
              <h2 className="text-[44px] font-semibold leading-[1.1] mt-2" style={{ fontFamily: "var(--font-head)", color: "var(--navy)" }}>
                {T("Жақын іс-шаралар", "Ближайшие события")}
              </h2>
              <p className="text-[color:var(--ink-2)] max-w-[640px] mt-2.5 text-[16px]">
                {T(
                  "Концерттер, қойылымдар, фестивальдер мен шеберханалар — таңдаңыз да онлайн орындықтарды броньдаңыз.",
                  "Концерты, спектакли, фестивали и мастер-классы — выбирайте и бронируйте места онлайн."
                )}
              </p>
            </div>
            <Link href={`/${locale}/events`}
                  className="hidden sm:inline-flex items-center gap-2 font-semibold text-[14px] text-[color:var(--navy)] pb-0.5 border-b-[1.5px] border-[color:var(--ochre)] hover:text-[color:var(--coral-600)] hover:border-[color:var(--coral-600)]">
              {T("Барлық іс-шаралар", "Все события")} →
            </Link>
          </div>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {data.events.slice(0, 4).map((ev) => (
              <EventCard key={ev.id} event={ev} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular clubs */}
      <section className="py-20">
        <div className="max-w-[1240px] mx-auto px-7">
          <div className="flex items-end justify-between gap-10 mb-11">
            <div>
              <div className="eyebrow">{T("Шығармашылық студиялар", "Творческие студии")}</div>
              <h2 className="text-[44px] font-semibold leading-[1.1] mt-2" style={{ fontFamily: "var(--font-head)", color: "var(--navy)" }}>
                {T("Танымал үйірмелер", "Популярные кружки")}
              </h2>
              <p className="text-[color:var(--ink-2)] max-w-[640px] mt-2.5 text-[16px]">
                {T(
                  "Балалар мен ересектерге арналған 20+ бағыт — академиялық вокалдан робототехникаға дейін.",
                  "20+ направлений для детей и взрослых — от академического вокала до робототехники."
                )}
              </p>
            </div>
            <Link href={`/${locale}/clubs`}
                  className="hidden sm:inline-flex items-center gap-2 font-semibold text-[14px] text-[color:var(--navy)] pb-0.5 border-b-[1.5px] border-[color:var(--ochre)] hover:text-[color:var(--coral-600)] hover:border-[color:var(--coral-600)]">
              {T("Барлық үйірмелер", "Все кружки")} →
            </Link>
          </div>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {data.clubs.map((club) => (
              <ClubCard key={club.id} club={club} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Halls */}
      <section className="py-20 bg-white">
        <div className="max-w-[1240px] mx-auto px-7">
          <div className="flex items-end justify-between gap-10 mb-11">
            <div>
              <div className="eyebrow">{T("Жалдау", "Аренда")}</div>
              <h2 className="text-[44px] font-semibold leading-[1.1] mt-2" style={{ fontFamily: "var(--font-head)", color: "var(--navy)" }}>
                {T("Кез келген іс-шараға үш зал", "Три зала для любых событий")}
              </h2>
              <p className="text-[color:var(--ink-2)] max-w-[640px] mt-2.5 text-[16px]">
                {T(
                  "Симфониялық концерттен камералық кешке дейін — міндетіңізге сай алаңды таңдаймыз.",
                  "От симфонического концерта до камерного вечера — мы подберём площадку под вашу задачу."
                )}
              </p>
            </div>
            <Link href={`/${locale}/rent`}
                  className="hidden sm:inline-flex items-center gap-2 font-semibold text-[14px] text-[color:var(--navy)] pb-0.5 border-b-[1.5px] border-[color:var(--ochre)] hover:text-[color:var(--coral-600)] hover:border-[color:var(--coral-600)]">
              {T("Зал жалдау", "Арендовать зал")} →
            </Link>
          </div>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {data.halls.map((h) => (
              <HallCard key={h.id} hall={h} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest news */}
      <section className="py-20">
        <div className="max-w-[1240px] mx-auto px-7">
          <div className="flex items-end justify-between gap-10 mb-11">
            <div>
              <div className="eyebrow">{T("Жаңалықтар", "Новости")}</div>
              <h2 className="text-[44px] font-semibold leading-[1.1] mt-2" style={{ fontFamily: "var(--font-head)", color: "var(--navy)" }}>
                {T("Соңғы жаңалықтар", "Последние новости")}
              </h2>
            </div>
            <Link href={`/${locale}/news`}
                  className="hidden sm:inline-flex items-center gap-2 font-semibold text-[14px] text-[color:var(--navy)] pb-0.5 border-b-[1.5px] border-[color:var(--ochre)] hover:text-[color:var(--coral-600)] hover:border-[color:var(--coral-600)]">
              {T("Барлық жаңалықтар", "Все новости")} →
            </Link>
          </div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {data.news.map((n) => (
              <NewsCard key={n.id} news={n} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-[1240px] mx-auto px-7">
          <div className="cta-block">
            <div className="relative">
              <div className="eyebrow" style={{ color: "var(--ochre-soft)" }}>
                {T("Біз ынтымақтастыққа ашықпыз", "Мы открыты к сотрудничеству")}
              </div>
              <h2>
                {T("Сәтбаевтың жүрегінде", "Готовы провести событие")}
                <br />
                {T("іс-шара өткізуге дайынсыз ба?", "в сердце Сатпаева?")}
              </h2>
              <p>
                {T(
                  "Концерттер, конференциялар, той-мерекелер, бітіру кештері, корпоратив іс-шаралары — өтінімнен сахнаға дейін әр қадамда көмектесеміз.",
                  "Концерты, конференции, торжества, выпускные, корпоративные мероприятия — помогаем на каждом шаге от заявки до сцены."
                )}
              </p>
            </div>
            <div className="cta-actions">
              <Link href={`/${locale}/rent`} className="btn btn-primary">
                {T("Өтінім қалдыру", "Оставить заявку")} →
              </Link>
              <Link href={`/${locale}/contacts`} className="btn btn-outline">
                {T("Бізбен байланыс", "Связаться с нами")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
