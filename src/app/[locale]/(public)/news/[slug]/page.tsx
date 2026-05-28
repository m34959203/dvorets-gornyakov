import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isValidLocale, type Locale, getLocalizedField } from "@/lib/i18n";
import { getOne, getMany } from "@/lib/db";
import { localizeNewsCategory } from "@/lib/news-category";
import { newsArticleJsonLd, siteBase } from "@/lib/jsonld";
import JsonLd from "@/components/JsonLd";
import ShareRow from "@/components/features/ShareRow";
import DgPageHero from "@/components/layout/DgPageHero";
import DgIcon from "@/components/layout/DgIcon";

export const dynamic = "force-dynamic";

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
    title,
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
      "Уважаемые жители и гости города!\n\nДворец горняков им. Ш. Дильдебаева приглашает вас на праздник Наурыз. Вас ждут праздничный концерт, национальные игры, выставки и мастер-классы.\n\nПрограмма:\n- 10:00 - Торжественное открытие\n- 11:00 - Национальные игры\n- 14:00 - Концерт\n- 16:00 - Мастер-классы\n\nВход свободный. Ждём всех!",
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

  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const dateLabel = new Date(publishedAt).toLocaleDateString(
    locale === "kk" ? "kk-KZ" : "ru-RU",
    { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Almaty" }
  );

  const categoryLabel = category ? localizeNewsCategory(category, locale) : "";
  const tagLine = [categoryLabel, dateLabel].filter(Boolean).join(" · ");

  const imageUrl = dbRow?.image_url ?? "/photos/dvorets-06.webp";
  const shareUrl = `${siteBase()}/${locale}/news/${slug}`;

  // Другие новости — 3 свежих, кроме текущей
  const others = await getMany<{ slug: string; title_kk: string; title_ru: string; image_url: string | null; published_at: string | null }>(
    `SELECT slug, title_kk, title_ru, image_url, published_at
       FROM news WHERE status='published' AND slug <> $1
      ORDER BY published_at DESC NULLS LAST LIMIT 3`,
    [slug]
  ).catch(() => [] as Array<{ slug: string; title_kk: string; title_ru: string; image_url: string | null; published_at: string | null }>);

  // Detect HTML content (produced by rich-text editor) vs plain text
  const isHtml = content.trimStart().startsWith("<");

  return (
    <div className="dg-home">
      <JsonLd
        data={newsArticleJsonLd({
          locale,
          headline: title,
          datePublished: publishedAt,
          image: imageUrl,
          url: `${siteBase()}/${locale}/news/${slug}`,
        })}
      />
      <DgPageHero
        crumbs={[
          { label: T("Басты бет", "Главная"), href: `/${locale}` },
          { label: T("Жаңалықтар", "Новости"), href: `/${locale}/news` },
          { label: title },
        ]}
        tag={tagLine}
        h2Html={title}
      />

      <section className="section" style={{ borderTop: 0 }}>
        <div className="dg-wrap">
          <article style={{ maxWidth: "72ch" }}>
            {/* Cover image */}
            <div className="detail-cover" style={{ marginBottom: 36 }}>
              <Image src={imageUrl} alt={title} fill sizes="(max-width: 900px) 100vw, 720px" />
            </div>

            {/* Category badge + date meta */}
            {(categoryLabel || dateLabel) && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                {categoryLabel && (
                  <div className="poster-tag" style={{ position: "static", display: "inline-block" }}>
                    {categoryLabel}
                  </div>
                )}
                {dateLabel && (
                  <span className="news-date" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <DgIcon name="calendar" size={13} />
                    <time dateTime={publishedAt}>{dateLabel}</time>
                  </span>
                )}
              </div>
            )}

            {/* Embed / video */}
            {embedCode ? (
              <div
                style={{ aspectRatio: "16/9", overflow: "hidden", borderRadius: 8, marginBottom: 28, background: "#000" }}
                dangerouslySetInnerHTML={{ __html: embedCode }}
              />
            ) : videoUrl ? (
              <video
                controls
                style={{ width: "100%", aspectRatio: "16/9", borderRadius: 8, marginBottom: 28, background: "#000" }}
                src={videoUrl}
              />
            ) : null}

            {/* Article body */}
            <div className="dg-prose">
              {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                content.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))
              )}
            </div>
            <ShareRow url={shareUrl} title={title} locale={locale} />
          </article>

          {/* Другие новости */}
          {others.length > 0 && (
            <div style={{ marginTop: 64 }}>
              <div className="section-bar" style={{ marginBottom: 28 }}>
                <div className="tag">— {T("Тағы да", "Ещё")} —</div>
                <h2 className="h2">{T("Басқа жаңалықтар", "Другие новости")}</h2>
              </div>
              <div className="news-grid">
                {others.map((n) => {
                  const ot = getLocalizedField(n as unknown as Record<string, unknown>, "title", locale);
                  return (
                    <Link key={n.slug} href={`/${locale}/news/${n.slug}`} className="news-item">
                      <div className="news-media">
                        <Image src={n.image_url ?? "/photos/dvorets-06.webp"} alt={ot} fill sizes="(max-width: 768px) 50vw, 25vw" />
                      </div>
                      {n.published_at && (
                        <p className="news-date">
                          {new Date(n.published_at).toLocaleDateString(locale === "kk" ? "kk-KZ" : "ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Almaty" })}
                        </p>
                      )}
                      <h3 className="news-title">{ot}</h3>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Back link */}
          <div style={{ marginTop: 48 }}>
            <Link href={`/${locale}/news`} className="section-link" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <DgIcon name="chev-l" size={16} />
              {T("Барлық жаңалықтар", "Все новости")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
