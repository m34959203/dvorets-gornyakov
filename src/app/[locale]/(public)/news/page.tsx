import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { isValidLocale, type Locale, getLocalizedField } from "@/lib/i18n";
import { getMany } from "@/lib/db";
import DgPageHero from "@/components/layout/DgPageHero";

export const dynamic = "force-dynamic";

const FALLBACK_PHOTOS = [
  "/photos/dvorets-02.webp",
  "/photos/dvorets-06.webp",
  "/photos/dvorets-13.webp",
];

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
  // Короткий титл — site name добавит template из (public)/layout.tsx
  const title = locale === "kk" ? "Жаңалықтар" : "Новости";
  const description =
    locale === "kk"
      ? "Ш. Ділдебаев атындағы тау-кенші сарайының соңғы жаңалықтары, хабарландырулары мен іс-шаралары."
      : "Последние новости, анонсы и события Дворца горняков им. Ш. Дильдебаева.";
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/${locale}/news`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: "/photos/og-cover.jpg", width: 1200, height: 630 }],
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

function formatDate(isoString: string, locale: Locale): string {
  const d = new Date(isoString);
  return d.toLocaleDateString(locale === "kk" ? "kk-KZ" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Almaty",
  });
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const { items } = await loadNews();

  return (
    <div className="dg-home">
      <a href="#news-grid" className="dg-skip-link">
        {T("Жаңалықтарға өту", "Перейти к новостям")}
      </a>
      <DgPageHero
        crumbs={[
          { label: T("Басты бет", "Главная"), href: `/${locale}` },
          { label: T("Жаңалықтар", "Новости") },
        ]}
        tag={T("— Жаңалықтар —", "— Новости —")}
        h2Html={T(
          "Соңғы <strong>жаңалықтар</strong>",
          "Последние <strong>новости</strong>"
        )}
        lead={T(
          "Сарайдың өмірінен ең маңызды оқиғалар, жетістіктер мен хабарландырулар.",
          "Главные события, достижения и анонсы из жизни Дворца горняков."
        )}
      />

      <section className="section section--light" style={{ borderTop: 0 }}>
        <div className="dg-wrap">
          <div id="news-grid" className="news-grid">
            {items.map((n, idx) => {
              const title = getLocalizedField(
                n as unknown as Record<string, unknown>,
                "title",
                locale
              );
              const excerpt = getLocalizedField(
                n as unknown as Record<string, unknown>,
                "excerpt",
                locale
              );
              const imgSrc =
                n.image_url ?? FALLBACK_PHOTOS[idx % FALLBACK_PHOTOS.length];
              const dateStr = formatDate(n.published_at, locale);

              return (
                <Link
                  key={n.id}
                  href={`/${locale}/news/${n.slug}`}
                  className="news-item"
                >
                  <div className="news-media">
                    <Image src={imgSrc} alt={title} fill sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>
                  <p className="news-date">{dateStr}</p>
                  <h3 className="news-title">{title}</h3>
                  {excerpt && <p className="news-excerpt">{excerpt}</p>}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
