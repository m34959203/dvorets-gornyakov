import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getLocalizedField } from "@/lib/i18n";
import { formatDate, truncate } from "@/lib/utils";

interface NewsItem {
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
}

interface NewsCardProps {
  news: NewsItem;
  locale: Locale;
}

const FALLBACK_IMG = "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80";

export default function NewsCard({ news, locale }: NewsCardProps) {
  const title = getLocalizedField(news, "title", locale);
  const excerpt = getLocalizedField(news, "excerpt", locale);
  const hasVideo = Boolean(news.video_url || (news.embed_code && news.embed_code.trim()));
  const img = news.image_url || FALLBACK_IMG;

  return (
    <Link href={`/${locale}/news/${news.slug}`} className="news-card no-underline">
      <div className="news-media relative">
        <img src={img} alt={title} loading="lazy" />
        {hasVideo && (
          <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 ml-0.5" style={{ color: "var(--navy)" }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </div>
      <div className="news-body">
        <div className="news-meta">
          {news.category && <span className="badge-soft">{news.category}</span>}
          {news.published_at && <span className="news-date">{formatDate(news.published_at, locale)}</span>}
        </div>
        <h3 className="news-title line-clamp-2">{title}</h3>
        <p className="news-desc line-clamp-3">{truncate(excerpt, 160)}</p>
        <div className="news-more">
          {locale === "kk" ? "Оқу" : "Читать"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
