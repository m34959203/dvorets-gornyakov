import Link from "next/link";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";

const demoArticles: Record<string, { title_kk: string; title_ru: string; content_kk: string; content_ru: string; category: string; published_at: string }> = {
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

  const article = demoArticles[slug] || {
    title_kk: "Мақала табылмады",
    title_ru: "Статья не найдена",
    content_kk: "Бұл мақала табылмады.",
    content_ru: "Эта статья не найдена.",
    category: "",
    published_at: new Date().toISOString(),
  };

  const title = locale === "kk" ? article.title_kk : article.title_ru;
  const content = locale === "kk" ? article.content_kk : article.content_ru;

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

        <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
          {content}
        </div>
      </article>
    </div>
  );
}
