import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLocale, type Locale, getMessages, getLocalizedField } from "@/lib/i18n";
import { getOne } from "@/lib/db";

export const dynamic = "force-dynamic";

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
  content_kk: string | null;
  content_ru: string | null;
  image_url: string | null;
  video_url: string | null;
  embed_code: string | null;
  category: string | null;
  published_at: string | null;
};

type NewsMeta = {
  slug: string;
  title_kk: string;
  title_ru: string;
  excerpt_kk: string | null;
  excerpt_ru: string | null;
  image_url: string | null;
};

async function loadNewsMeta(slug: string): Promise<NewsMeta | null> {
  try {
    return await getOne<NewsMeta>(
      `SELECT slug, title_kk, title_ru, excerpt_kk, excerpt_ru, image_url
         FROM news WHERE slug = $1 AND status = 'published'`,
      [slug]
    );
  } catch {
    return null;
  }
}

async function loadArticle(slug: string): Promise<NewsRow | null> {
  try {
    return await getOne<NewsRow>(
      `SELECT slug, title_kk, title_ru, excerpt_kk, excerpt_ru,
              content_kk, content_ru, image_url, video_url, embed_code,
              category, published_at
         FROM news
        WHERE slug = $1 AND status = 'published'`,
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
    content_kk:
      "Құрметті қала тұрғындары мен қонақтары!\n\nШ. Ділдебаев атындағы тау-кенші сарайы сіздерді Наурыз мерекесіне шақырады. Мерекелік концерт, ұлттық ойындар, көрмелер мен шеберханалар сіздерді күтеді.\n\nБағдарлама:\n- 10:00 - Мерекелік ашылу\n- 11:00 - Ұлттық ойындар\n- 14:00 - Концерт\n- 16:00 - Шеберханалар\n\nКіру тегін. Барлығын күтеміз!",
    content_ru:
      "Уважаемые жители и гости города!\n\nДворец горняков им. Ш. Дільдебаева приглашает вас на праздник Наурыз. Вас ждут праздничный концерт, национальные игры, выставки и мастер-классы.\n\nПрограмма:\n- 10:00 - Торжественное открытие\n- 11:00 - Национальные игры\n- 14:00 - Концерт\n- 16:00 - Мастер-классы\n\nВход свободный. Ждём всех!",
    category: "events",
    published_at: "2026-03-15T10:00:00Z",
  },
  "new-clubs-2026": {
    title_kk: "Жаңа оқу жылына үйірмелерге жазылу",
    title_ru: "Запись в кружки на новый учебный год",
    content_kk:
      "2026-2027 оқу жылына үйірмелерге жазылу басталды.\n\nСарайда 20-дан астам түрлі бағыттағы үйірмелер жұмыс істейді: би, ән, театр, сурет, қолөнер, робототехника және басқалары.\n\nЖазылу үшін «Үйірмелер» бөлімінен өтінім қалдырыңыз немесе сарайдың әкімшілігіне жолығыңыз.",
    content_ru:
      "Открыта запись в кружки на 2026-2027 учебный год.\n\nВо дворце работают более 20 кружков разных направлений: танцы, вокал, театр, рисование, прикладное искусство, робототехника и другие.\n\nДля записи оставьте заявку в разделе «Кружки» или обратитесь в администрацию дворца.",
    category: "announcement",
    published_at: "2026-03-10T10:00:00Z",
  },
  "competition-results": {
    title_kk: "Байқау нәтижелері",
    title_ru: "Результаты конкурса",
    content_kk:
      "Облыстық шығармашылық байқауының нәтижелері жарияланды.\n\nБіздің сарайдың ұжымдары бірнеше жүлделі орын иеленді. Жеңімпаздарды шын жүректен құттықтаймыз!",
    content_ru:
      "Опубликованы результаты областного творческого конкурса.\n\nКоллективы нашего дворца заняли несколько призовых мест. Искренне поздравляем победителей!",
    category: "news",
    published_at: "2026-03-05T10:00:00Z",
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

  const dbRow = await loadArticle(slug);

  let title: string;
  let content: string;
  let category: string;
  let publishedAt: string;
  let embedCode = "";
  let videoUrl = "";

  if (dbRow) {
    title = getLocalizedField(dbRow, "title", locale);
    content = getLocalizedField(dbRow, "content", locale);
    category = dbRow.category || "";
    publishedAt = dbRow.published_at || new Date().toISOString();
    embedCode = dbRow.embed_code && dbRow.embed_code.trim() ? dbRow.embed_code : "";
    videoUrl = dbRow.video_url || "";
  } else {
    const demo = demoArticles[slug];
    if (!demo) {
      notFound();
    }
    title = locale === "kk" ? demo.title_kk : demo.title_ru;
    content = locale === "kk" ? demo.content_kk : demo.content_ru;
    category = demo.category;
    publishedAt = demo.published_at;
    embedCode = demo.embed_code && demo.embed_code.trim() ? demo.embed_code : "";
    videoUrl = demo.video_url || "";
  }

  const dateLabel = new Date(publishedAt).toLocaleDateString(
    locale === "kk" ? "kk-KZ" : "ru-RU",
    { day: "numeric", month: "long", year: "numeric" }
  );

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
            <time>{dateLabel}</time>
            {category && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                {category}
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
