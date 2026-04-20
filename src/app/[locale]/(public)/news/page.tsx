import type { Metadata } from "next";
import { getMessages, isValidLocale, type Locale } from "@/lib/i18n";
import { getMany } from "@/lib/db";
import NewsCard from "@/components/features/NewsCard";

export const dynamic = "force-dynamic";

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
      ? `Жаңалықтар — ${SITE_NAME_KK}`
      : `Новости — ${SITE_NAME_RU}`;
  const description =
    locale === "kk"
      ? "Ш. Ділдебаев атындағы тау-кенші сарайының соңғы жаңалықтары, хабарландырулары мен іс-шаралары."
      : "Последние новости, анонсы и события Дворца горняков им. Ш. Дільдебаева.";
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/${locale}/news`;
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
        kk: `${baseUrl}/kk/news`,
        ru: `${baseUrl}/ru/news`,
      },
    },
  };
}

type NewsItem = {
  id: string;
  slug: string;
  title_kk: string;
  title_ru: string;
  excerpt_kk: string;
  excerpt_ru: string;
  image_url: string | null;
  category: string;
  published_at: string;
  video_url?: string | null;
  embed_code?: string;
};

const demoNews: NewsItem[] = [
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

async function loadNews(): Promise<{ items: NewsItem[]; isDemo: boolean }> {
  try {
    const rows = await getMany<NewsItem>(
      `SELECT id, slug, title_kk, title_ru, excerpt_kk, excerpt_ru,
              image_url, video_url, embed_code, category, published_at
         FROM news
        WHERE status = 'published'
        ORDER BY published_at DESC NULLS LAST, created_at DESC
        LIMIT 30`
    );
    if (!rows.length) {
      return { items: demoNews, isDemo: true };
    }
    return { items: rows, isDemo: false };
  } catch {
    return { items: demoNews, isDemo: true };
  }
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);
  const t = messages.news;

  const { items } = await loadNews();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>
      {items.length === 0 ? (
        <p className="text-gray-500">{t.noNews}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <NewsCard key={item.id} news={item} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
