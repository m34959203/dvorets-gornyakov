import { getMessages, isValidLocale, type Locale } from "@/lib/i18n";
import NewsCard from "@/components/features/NewsCard";

const demoNews = [
  { id: "1", slug: "nauryz-2026", title_kk: "Наурыз мерекесіне шақырамыз!", title_ru: "Приглашаем на праздник Наурыз!", excerpt_kk: "Сарайда Наурыз мерекесіне арналған мерекелік іс-шаралар өтеді", excerpt_ru: "Во дворце пройдут праздничные мероприятия, посвящённые Наурызу", image_url: null, category: "events", published_at: "2026-03-15T10:00:00Z" },
  { id: "2", slug: "new-clubs-2026", title_kk: "Жаңа оқу жылына үйірмелерге жазылу", title_ru: "Запись в кружки на новый учебный год", excerpt_kk: "2026-2027 оқу жылына үйірмелерге жазылу басталды", excerpt_ru: "Открыта запись в кружки на 2026-2027 учебный год", image_url: null, category: "announcement", published_at: "2026-03-10T10:00:00Z" },
  { id: "3", slug: "competition-results", title_kk: "Байқау нәтижелері", title_ru: "Результаты конкурса", excerpt_kk: "Облыстық шығармашылық байқауының нәтижелері жарияланды", excerpt_ru: "Опубликованы результаты областного творческого конкурса", image_url: null, category: "news", published_at: "2026-03-05T10:00:00Z" },
  { id: "4", slug: "summer-camp", title_kk: "Жазғы лагерь ашылады", title_ru: "Открывается летний лагерь", excerpt_kk: "Балаларға арналған жазғы шығармашылық лагері ашылады", excerpt_ru: "Открывается летний творческий лагерь для детей", image_url: null, category: "announcement", published_at: "2026-02-28T10:00:00Z" },
  { id: "5", slug: "dance-competition", title_kk: "Би байқауы", title_ru: "Танцевальный конкурс", excerpt_kk: "Облыстық би байқауында біздің студия жеңімпаз атанды", excerpt_ru: "Наша студия стала победителем областного конкурса танцев", image_url: null, category: "achievements", published_at: "2026-02-20T10:00:00Z" },
  { id: "6", slug: "art-exhibition", title_kk: "Сурет көрмесі", title_ru: "Художественная выставка", excerpt_kk: "Жас суретшілердің көрмесі ашылды", excerpt_ru: "Открылась выставка юных художников", image_url: null, category: "events", published_at: "2026-02-15T10:00:00Z" },
];

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);
  const t = messages.news;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoNews.map((item) => (
          <NewsCard key={item.id} news={item} locale={locale} />
        ))}
      </div>
    </div>
  );
}
