import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
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
}

interface NewsCardProps {
  news: NewsItem;
  locale: Locale;
}

export default function NewsCard({ news, locale }: NewsCardProps) {
  const title = getLocalizedField(news, "title", locale);
  const excerpt = getLocalizedField(news, "excerpt", locale);

  return (
    <Card hoverable>
      <Link href={`/${locale}/news/${news.slug}`}>
        <div className="aspect-video bg-gray-200 relative overflow-hidden">
          {news.image_url ? (
            <img src={news.image_url} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <svg className="w-12 h-12 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}
          {news.category && (
            <div className="absolute top-2 left-2">
              <Badge variant="primary">{news.category}</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {truncate(excerpt, 150)}
          </p>
          <div className="text-xs text-gray-400">
            {news.published_at && formatDate(news.published_at, locale)}
          </div>
        </div>
      </Link>
    </Card>
  );
}
