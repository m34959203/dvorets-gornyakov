import type { Metadata } from "next";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";
import EventCalendar from "@/components/features/EventCalendar";

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
      ? `Іс-шаралар — ${SITE_NAME_KK}`
      : `Мероприятия — ${SITE_NAME_RU}`;
  const description =
    locale === "kk"
      ? "Концерттер, көрмелер, шеберханалар мен фестивальдер — Ш. Ділдебаев атындағы тау-кенші сарайындағы жақын арадағы іс-шаралар."
      : "Концерты, выставки, мастер-классы и фестивали — ближайшие мероприятия Дворца горняков им. Ш. Дільдебаева.";
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/${locale}/events`;
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
        kk: `${baseUrl}/kk/events`,
        ru: `${baseUrl}/ru/events`,
      },
    },
  };
}

const demoEvents = [
  { id: "1", title_kk: "Наурыз мерекесіне арналған концерт", title_ru: "Концерт к празднику Наурыз", description_kk: "Наурыз мейрамына арналған мерекелік концерт", description_ru: "Праздничный концерт, посвящённый празднику Наурыз", image_url: null, event_type: "concert" as const, start_date: "2026-03-22T18:00:00Z", location: "Негізгі зал" },
  { id: "2", title_kk: "Балаларға арналған би шеберханасы", title_ru: "Танцевальный мастер-класс для детей", description_kk: "Балаларға арналған тегін би шеберханасы", description_ru: "Бесплатный танцевальный мастер-класс для детей", image_url: null, event_type: "workshop" as const, start_date: "2026-04-15T14:00:00Z", location: "Хореография залы" },
  { id: "3", title_kk: "Жас суретшілер көрмесі", title_ru: "Выставка юных художников", description_kk: "Жас суретшілердің шығармашылық көрмесі", description_ru: "Творческая выставка юных художников", image_url: null, event_type: "exhibition" as const, start_date: "2026-05-01T10:00:00Z", location: "Галерея" },
  { id: "4", title_kk: "Жас орындаушылар фестивалі", title_ru: "Фестиваль юных исполнителей", description_kk: "Жас орындаушылардың шығармашылық фестивалі", description_ru: "Творческий фестиваль юных исполнителей", image_url: null, event_type: "festival" as const, start_date: "2026-06-01T11:00:00Z", location: "Концерт залы" },
  { id: "5", title_kk: "Сурет байқауы", title_ru: "Конкурс рисунков", description_kk: "Балалар арасындағы сурет байқауы", description_ru: "Конкурс рисунков среди детей", image_url: null, event_type: "competition" as const, start_date: "2026-04-20T10:00:00Z", location: "Арт-студия" },
  { id: "6", title_kk: "Фортепиано кеші", title_ru: "Вечер фортепиано", description_kk: "Классикалық музыка кеші", description_ru: "Вечер классической музыки", image_url: null, event_type: "concert" as const, start_date: "2026-04-25T19:00:00Z", location: "Камерный зал" },
];

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{messages.events.title}</h1>
      <EventCalendar locale={locale} initialEvents={demoEvents} />
    </div>
  );
}
