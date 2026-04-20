import Link from "next/link";
import { getMessages, isValidLocale, type Locale } from "@/lib/i18n";
import HomeHero from "@/components/features/HomeHero";
import NewsCard from "@/components/features/NewsCard";
import ClubCard from "@/components/features/ClubCard";
import HallCard from "@/components/features/HallCard";
import CalendarStrip from "@/components/features/CalendarStrip";

function getDemoData(locale: Locale) {
  const events = [
    { id: "1", title_kk: "Наурыз мерекесіне арналған концерт", title_ru: "Симфонический концерт к Наурызу", description_kk: "", description_ru: "", image_url: null, event_type: "concert", start_date: "2026-03-22T18:00:00Z", location: locale === "kk" ? "Негізгі зал" : "Главный зал", price: "от 2 500 ₸" },
    { id: "2", title_kk: "Қазақ поэзиясы кеші", title_ru: "Вечер казахской поэзии", description_kk: "", description_ru: "", image_url: null, event_type: "other", start_date: "2026-04-05T19:00:00Z", location: locale === "kk" ? "Камералық зал" : "Камерный зал", price: "0" },
    { id: "3", title_kk: "Балалар би шеберханасы", title_ru: "Танцевальный мастер-класс для детей", description_kk: "", description_ru: "", image_url: null, event_type: "workshop", start_date: "2026-04-15T14:00:00Z", location: locale === "kk" ? "Репетиция залы" : "Репетиционный", price: "от 1 000 ₸" },
    { id: "4", title_kk: "Жас суретшілер көрмесі", title_ru: "Выставка юных художников", description_kk: "", description_ru: "", image_url: null, event_type: "exhibition", start_date: "2026-05-01T10:00:00Z", location: locale === "kk" ? "Галерея" : "Галерея", price: "0" },
    { id: "5", title_kk: "Халық билерінің фестивалі", title_ru: "Фестиваль народных танцев", description_kk: "", description_ru: "", image_url: null, event_type: "festival", start_date: "2026-05-10T17:00:00Z", location: locale === "kk" ? "Негізгі зал" : "Главный зал", price: "от 1 500 ₸" },
    { id: "6", title_kk: "Театр қойылымы «Абай жолы»", title_ru: "Спектакль «Путь Абая»", description_kk: "", description_ru: "", image_url: null, event_type: "other", start_date: "2026-05-18T19:00:00Z", location: locale === "kk" ? "Негізгі зал" : "Главный зал", price: "от 3 000 ₸" },
    { id: "7", title_kk: "Фортепиано байқауы", title_ru: "Конкурс юных пианистов", description_kk: "", description_ru: "", image_url: null, event_type: "competition", start_date: "2026-05-25T14:00:00Z", location: locale === "kk" ? "Камералық зал" : "Камерный зал", price: "0" },
    { id: "8", title_kk: "Жазғы балалар мерекесі", title_ru: "Детский летний праздник", description_kk: "", description_ru: "", image_url: null, event_type: "festival", start_date: "2026-06-01T11:00:00Z", location: locale === "kk" ? "Алаң" : "Площадь", price: "0" },
  ];

  const clubs = [
    { id: "1", name_kk: "Вокал студиясы", name_ru: "Вокальная студия", description_kk: "Кәсіби вокал сабақтары", description_ru: "Академический и эстрадный вокал — сольное пение и ансамбль.", image_url: null, age_group: "7-18", direction: "vocal", instructor_name: "Айгүл Серікқызы" },
    { id: "2", name_kk: "Халық билері", name_ru: "Народные танцы", description_kk: "Қазақ ұлттық билері", description_ru: "Казахские национальные танцы и постановки для фестивалей.", image_url: null, age_group: "5-16", direction: "dance", instructor_name: "Динара Маратқызы" },
    { id: "3", name_kk: "Бейнелеу өнері", name_ru: "Изобразительное искусство", description_kk: "Сурет, кескіндеме, графика", description_ru: "Рисунок, живопись, графика и основы композиции.", image_url: null, age_group: "6-17", direction: "art", instructor_name: "Бауыржан Нұрланұлы" },
    { id: "4", name_kk: "Театр студиясы", name_ru: "Театральная студия", description_kk: "Актёрлік шеберлік", description_ru: "Актёрское мастерство, сценическая речь, сценодвижение.", image_url: null, age_group: "8-18", direction: "theater", instructor_name: "Сәуле Бекенқызы" },
  ];

  const news = [
    { id: "1", slug: "nauryz-2026", title_kk: "Наурыз мерекесіне шақырамыз!", title_ru: "Приглашаем на праздник Наурыз!", excerpt_kk: "Мерекелік іс-шаралар", excerpt_ru: "Во дворце пройдут праздничные мероприятия, посвящённые Наурызу.", image_url: null, category: locale === "kk" ? "Жаңалықтар" : "Новости", published_at: "2026-03-15T10:00:00Z" },
    { id: "2", slug: "new-clubs-2026", title_kk: "Жаңа оқу жылына жазылу", title_ru: "Запись в кружки на новый сезон", excerpt_kk: "2026-2027 оқу жылы", excerpt_ru: "Открыта запись в 20+ творческих студий на 2026–2027 учебный год.", image_url: null, category: locale === "kk" ? "Үйірмелер" : "Студии", published_at: "2026-03-10T10:00:00Z" },
    { id: "3", slug: "competition-results", title_kk: "Байқау нәтижелері", title_ru: "Итоги областного конкурса", excerpt_kk: "Облыстық шығармашылық байқау", excerpt_ru: "Опубликованы результаты областного творческого конкурса среди школьников.", image_url: null, category: locale === "kk" ? "Байқау" : "Конкурсы", published_at: "2026-03-05T10:00:00Z" },
  ];

  const halls = locale === "kk"
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

  return { events, clubs, news, halls };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);
  const t = messages.home;

  const demo = getDemoData(locale);

  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  return (
    <div>
      {/* Hero with upcoming events widget */}
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

      {/* Gemini presentation link */}
      <section className="bg-[color:var(--navy-900)] text-white">
        <div className="max-w-[1240px] mx-auto px-7 py-5">
          <a
            href="https://gemini.google.com/share/a9882ca2ba44"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
          >
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8e75f5] via-[#61a6ff] to-[#8fd8ff] flex items-center justify-center shadow-lg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--ochre-soft)]">
                {T("Презентация", "Презентация")}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[16px] leading-snug">
                {T(
                  "Жоба презентациясы — Google Gemini",
                  "Презентация проекта — Google Gemini"
                )}
              </div>
              <div className="text-[13px] text-white/70 mt-0.5">
                {T(
                  "Жаңа қойындыда ашылады · gemini.google.com",
                  "Открывается в новой вкладке · gemini.google.com"
                )}
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[color:var(--ochre)] group-hover:text-[color:var(--ochre-soft)] shrink-0">
              {T("Ашу", "Открыть")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </span>
          </a>
        </div>
      </section>

      {/* Calendar strip */}
      <CalendarStrip locale={locale} />

      {/* Stats banner */}
      <section className="stats-banner">
        <div className="max-w-[1240px] mx-auto px-7">
          <div className="ornament on-dark mb-8" />
          <div className="stats-row">
            <div>
              <div className="stat-n">1965</div>
              <div className="stat-l">{T("негіз қаланған жыл", "год основания")}</div>
            </div>
            <div>
              <div className="stat-n">
                120<span>+</span>
              </div>
              <div className="stat-l">{T("жылына іс-шара", "событий в год")}</div>
            </div>
            <div>
              <div className="stat-n">
                500<span>+</span>
              </div>
              <div className="stat-l">{T("тәрбиеленуші", "воспитанников")}</div>
            </div>
            <div>
              <div className="stat-n">3</div>
              <div className="stat-l">{T("концерт залы", "концертных зала")}</div>
            </div>
          </div>
          <div className="ornament on-dark mt-8" />
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
            <Link
              href={`/${locale}/clubs`}
              className="hidden sm:inline-flex items-center gap-2 font-semibold text-[14px] text-[color:var(--navy)] pb-0.5 border-b-[1.5px] border-[color:var(--ochre)] hover:text-[color:var(--coral-600)] hover:border-[color:var(--coral-600)]"
            >
              {T("Барлық үйірмелер", "Все кружки")} →
            </Link>
          </div>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {demo.clubs.map((club) => (
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
            <Link
              href={`/${locale}/rent`}
              className="hidden sm:inline-flex items-center gap-2 font-semibold text-[14px] text-[color:var(--navy)] pb-0.5 border-b-[1.5px] border-[color:var(--ochre)] hover:text-[color:var(--coral-600)] hover:border-[color:var(--coral-600)]"
            >
              {T("Зал жалдау", "Арендовать зал")} →
            </Link>
          </div>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {demo.halls.map((h) => (
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
            <Link
              href={`/${locale}/news`}
              className="hidden sm:inline-flex items-center gap-2 font-semibold text-[14px] text-[color:var(--navy)] pb-0.5 border-b-[1.5px] border-[color:var(--ochre)] hover:text-[color:var(--coral-600)] hover:border-[color:var(--coral-600)]"
            >
              {T("Барлық жаңалықтар", "Все новости")} →
            </Link>
          </div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {demo.news.map((n) => (
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
