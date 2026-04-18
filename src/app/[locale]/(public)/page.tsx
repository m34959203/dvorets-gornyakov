import Link from "next/link";
import { getMessages, isValidLocale, type Locale } from "@/lib/i18n";
import HomeHero from "@/components/features/HomeHero";
import RentalChecklist from "@/components/features/RentalChecklist";
import NewsCard from "@/components/features/NewsCard";
import ClubCard from "@/components/features/ClubCard";
import EventCard from "@/components/features/EventCard";

// Demo data used when database is not available
function getDemoData(locale: Locale) {
  const events = [
    {
      id: "1",
      title_kk: "Наурыз мерекесіне арналған концерт",
      title_ru: "Концерт к празднику Наурыз",
      description_kk: "Наурыз мейрамына арналған мерекелік концерт",
      description_ru: "Праздничный концерт, посвящённый празднику Наурыз",
      image_url: null,
      event_type: "concert",
      start_date: "2026-03-22T18:00:00Z",
      location: "Негізгі зал",
    },
    {
      id: "2",
      title_kk: "Балаларға арналған би шеберханасы",
      title_ru: "Танцевальный мастер-класс для детей",
      description_kk: "Балаларға арналған тегін би шеберханасы",
      description_ru: "Бесплатный танцевальный мастер-класс для детей",
      image_url: null,
      event_type: "workshop",
      start_date: "2026-04-15T14:00:00Z",
      location: "Хореография залы",
    },
    {
      id: "3",
      title_kk: "Жас суретшілер көрмесі",
      title_ru: "Выставка юных художников",
      description_kk: "Жас суретшілердің шығармашылық көрмесі",
      description_ru: "Творческая выставка юных художников",
      image_url: null,
      event_type: "exhibition",
      start_date: "2026-05-01T10:00:00Z",
      location: "Галерея",
    },
  ];

  const clubs = [
    {
      id: "1",
      name_kk: "Вокал студиясы",
      name_ru: "Вокальная студия",
      description_kk: "Кәсіби вокал сабақтары балалар мен ересектерге",
      description_ru: "Профессиональные занятия вокалом для детей и взрослых",
      image_url: null,
      age_group: "7-18",
      direction: "vocal",
      instructor_name: "Айгуль Сериковна",
    },
    {
      id: "2",
      name_kk: "Халық билері",
      name_ru: "Народные танцы",
      description_kk: "Қазақтың ұлттық билерін үйрену",
      description_ru: "Изучение казахских национальных танцев",
      image_url: null,
      age_group: "5-16",
      direction: "dance",
      instructor_name: "Динара Маратовна",
    },
    {
      id: "3",
      name_kk: "Бейнелеу өнері студиясы",
      name_ru: "Студия изобразительного искусства",
      description_kk: "Сурет салу, кескіндеме, графика",
      description_ru: "Рисунок, живопись, графика",
      image_url: null,
      age_group: "6-99",
      direction: "art",
      instructor_name: "Бауыржан Нурланович",
    },
    {
      id: "4",
      name_kk: "Театр студиясы",
      name_ru: "Театральная студия",
      description_kk: "Актёрлік шеберлік, сценалық сөйлеу",
      description_ru: "Актёрское мастерство, сценическая речь",
      image_url: null,
      age_group: "8-18",
      direction: "theater",
      instructor_name: "Сауле Бекеновна",
    },
  ];

  const news = [
    {
      id: "1",
      slug: "nauryz-2026",
      title_kk: "Наурыз мерекесіне шақырамыз!",
      title_ru: "Приглашаем на праздник Наурыз!",
      excerpt_kk: "Сарайда Наурыз мерекесіне арналған мерекелік іс-шаралар өтеді",
      excerpt_ru: "Во дворце пройдут праздничные мероприятия, посвящённые Наурызу",
      image_url: null,
      category: "events",
      published_at: "2026-03-15T10:00:00Z",
    },
    {
      id: "2",
      slug: "new-clubs-2026",
      title_kk: "Жаңа оқу жылына үйірмелерге жазылу",
      title_ru: "Запись в кружки на новый учебный год",
      excerpt_kk: "2026-2027 оқу жылына үйірмелерге жазылу басталды",
      excerpt_ru: "Открыта запись в кружки на 2026-2027 учебный год",
      image_url: null,
      category: "announcement",
      published_at: "2026-03-10T10:00:00Z",
    },
    {
      id: "3",
      slug: "competition-results",
      title_kk: "Байқау нәтижелері",
      title_ru: "Результаты конкурса",
      excerpt_kk: "Облыстық шығармашылық байқауының нәтижелері жарияланды",
      excerpt_ru: "Опубликованы результаты областного творческого конкурса",
      image_url: null,
      category: "news",
      published_at: "2026-03-05T10:00:00Z",
    },
  ];

  return { events, clubs, news };
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

  const rental = messages.rental as unknown as Parameters<typeof RentalChecklist>[0]["messages"];

  return (
    <div>
      {/* Hero */}
      <HomeHero
        locale={locale}
        title={t.heroTitle}
        headline={t.heroHeadline}
        lead={t.heroLead}
        badge={t.heroBadge}
        ctaSchedule={t.heroCtaSchedule}
        ctaRent={t.heroCtaRent}
      />

      {/* Rental checklist */}
      <RentalChecklist locale={locale} messages={rental} />

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t.upcomingEvents}</h2>
          <Link
            href={`/${locale}/events`}
            className="text-primary hover:text-primary-dark font-medium text-sm"
          >
            {t.viewAll} &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demo.events.map((event) => (
            <EventCard key={event.id} event={event} locale={locale} />
          ))}
        </div>
      </section>

      {/* Popular Clubs */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t.popularClubs}</h2>
            <Link
              href={`/${locale}/clubs`}
              className="text-primary hover:text-primary-dark font-medium text-sm"
            >
              {t.viewAll} &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {demo.clubs.map((club) => (
              <ClubCard key={club.id} club={club} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t.latestNews}</h2>
          <Link
            href={`/${locale}/news`}
            className="text-primary hover:text-primary-dark font-medium text-sm"
          >
            {t.viewAll} &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demo.news.map((item) => (
            <NewsCard key={item.id} news={item} locale={locale} />
          ))}
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-accent mb-2">20+</div>
              <div className="text-white/80">
                {locale === "kk" ? "Үйірмелер мен студиялар" : "Кружков и студий"}
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">500+</div>
              <div className="text-white/80">
                {locale === "kk" ? "Тәрбиеленушілер" : "Воспитанников"}
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">60+</div>
              <div className="text-white/80">
                {locale === "kk" ? "Жылдық тәжірибе" : "Лет опыта"}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
