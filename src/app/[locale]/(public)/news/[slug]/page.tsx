import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, type Locale, getMessages, getLocalizedField } from "@/lib/i18n";
import { getOne } from "@/lib/db";
import { formatDate } from "@/lib/utils";

const SITE_NAME_KK = "Ш. Ділдебаев атындағы тау-кенші сарайы";
const SITE_NAME_RU = "Дворец горняков им. Ш. Дільдебаева";

function getBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  const fallback = env || "https://dvorets-gornyakov.kz";
  return fallback.replace(/\/$/, "");
}

type NewsRow = {
  slug: string;
  title_kk: string;
  title_ru: string;
  excerpt_kk: string | null;
  excerpt_ru: string | null;
  image_url: string | null;
};

async function loadNewsMeta(slug: string): Promise<NewsRow | null> {
  try {
    return await getOne<NewsRow>(
      `SELECT slug, title_kk, title_ru, excerpt_kk, excerpt_ru, image_url
         FROM news WHERE slug = $1 AND status = 'published'`,
      [slug]
    );
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: lp, slug } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const row = await loadNewsMeta(slug);

  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/${locale}/news/${slug}`;
  const languages = {
    kk: `${baseUrl}/kk/news/${slug}`,
    ru: `${baseUrl}/ru/news/${slug}`,
  };

  if (!row) {
    return { title: "Not found" };
  }

  const title = getLocalizedField(row, "title", locale);
  const description = getLocalizedField(row, "excerpt", locale);
  const images = row.image_url ? [row.image_url] : [];
  return {
    title: `${title} — ${locale === "kk" ? SITE_NAME_KK : SITE_NAME_RU}`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images,
    },
    alternates: {
      canonical,
      languages,
    },
  };
}

interface DemoArticle {
  title_kk: string;
  title_ru: string;
  content_kk: string;
  content_ru: string;
  category: string;
  published_at: string;
  video_url?: string | null;
  embed_code?: string;
}

const demoArticles: Record<string, DemoArticle> = {
  "nauryz-2026": {
    title_kk: "Наурыз мерекесіне шақырамыз!",
    title_ru: "Приглашаем на праздник Наурыз!",
    content_kk: "Құрметті қала тұрғындары мен қонақтары!\n\nШ. Ділдебаев атындағы тау-кенші сарайы сіздерді Наурыз мерекесіне шақырады. Мерекелік концерт, ұлттық ойындар, көрмелер мен шеберханалар сіздерді күтеді.\n\nБағдарлама:\n- 10:00 - Мерекелік ашылу\n- 11:00 - Ұлттық ойындар\n- 14:00 - Концерт\n- 16:00 - Шеберханалар\n\nКіру тегін. Барлығын күтеміз!",
    content_ru: "Уважаемые жители и гости города!\n\nДворец горняков им. Ш. Дільдебаева приглашает вас на праздник Наурыз. Вас ждут праздничный концерт, национальные игры, выставки и мастер-классы.\n\nПрограмма:\n- 10:00 - Торжественное открытие\n- 11:00 - Национальные игры\n- 14:00 - Концерт\n- 16:00 - Мастер-классы\n\nВход свободный. Ждём всех!",
    category: "events",
    published_at: "2026-03-15T10:00:00Z",
  },
};

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);

  const article: DemoArticle = demoArticles[slug] || {
    title_kk: "Мақала табылмады",
    title_ru: "Статья не найдена",
    content_kk: "Бұл мақала табылмады.",
    content_ru: "Эта статья не найдена.",
    category: "",
    published_at: new Date().toISOString(),
  };

  const title = locale === "kk" ? article.title_kk : article.title_ru;
  const content = locale === "kk" ? article.content_kk : article.content_ru;
  const embedCode = article.embed_code && article.embed_code.trim() ? article.embed_code : "";
  const videoUrl = article.video_url || "";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${locale}/news`}
        className="inline-flex items-center text-primary hover:text-primary-dark mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {messages.common.back}
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <time>{formatDate(article.published_at, locale)}</time>
            {article.category && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                {article.category}
              </span>
            )}
          </div>
        </header>

        {embedCode ? (
          <div
            className="aspect-video rounded-xl overflow-hidden mb-8 bg-black"
            dangerouslySetInnerHTML={{ __html: embedCode }}
          />
        ) : videoUrl ? (
          <video
            controls
            className="w-full aspect-video rounded-xl mb-8 bg-black"
            src={videoUrl}
          />
        ) : null}

        <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
          {content}
        </div>
      </article>
    </div>
  );
}
