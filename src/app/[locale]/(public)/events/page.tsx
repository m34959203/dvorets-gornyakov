import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";
import { getMany } from "@/lib/db";
import EventCalendar from "@/components/features/EventCalendar";

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

type EventRow = {
  id: string;
  title_kk: string;
  title_ru: string;
  description_kk: string;
  description_ru: string;
  image_url: string | null;
  event_type: string;
  start_date: string;
  location: string;
};

const demoEvents: EventRow[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title_kk: "Наурыз мерекесіне арналған концерт",
    title_ru: "Концерт к празднику Наурыз",
    description_kk: "Наурыз мейрамына арналған мерекелік концерт",
    description_ru: "Праздничный концерт, посвящённый празднику Наурыз",
    image_url: null,
    event_type: "concert",
    start_date: "2026-03-22T18:00:00Z",
    location: "Негізгі зал",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title_kk: "Балаларға арналған би шеберханасы",
    title_ru: "Танцевальный мастер-класс для детей",
    description_kk: "Балаларға арналған тегін би шеберханасы",
    description_ru: "Бесплатный танцевальный мастер-класс для детей",
    image_url: null,
    event_type: "workshop",
    start_date: "2026-04-15T14:00:00Z",
    location: "Хореография залы",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    title_kk: "Жас суретшілер көрмесі",
    title_ru: "Выставка юных художников",
    description_kk: "Жас суретшілердің шығармашылық көрмесі",
    description_ru: "Творческая выставка юных художников",
    image_url: null,
    event_type: "exhibition",
    start_date: "2026-05-01T10:00:00Z",
    location: "Галерея",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    title_kk: "Жас орындаушылар фестивалі",
    title_ru: "Фестиваль юных исполнителей",
    description_kk: "Жас орындаушылардың шығармашылық фестивалі",
    description_ru: "Творческий фестиваль юных исполнителей",
    image_url: null,
    event_type: "festival",
    start_date: "2026-06-01T11:00:00Z",
    location: "Концерт залы",
  },
];

async function loadEvents(): Promise<EventRow[]> {
  try {
    const rows = await getMany<EventRow>(
      `SELECT id, title_kk, title_ru,
              COALESCE(description_kk, '') AS description_kk,
              COALESCE(description_ru, '') AS description_ru,
              image_url, event_type, start_date,
              COALESCE(location, '') AS location
         FROM events
        WHERE status IN ('upcoming', 'ongoing')
        ORDER BY start_date ASC
        LIMIT 60`
    );
    if (!rows.length) {
      return demoEvents;
    }
    return rows;
  } catch {
    return demoEvents;
  }
}

const DATE_PARAM_RE = /^\d{4}-\d{2}-\d{2}$/;

function toAlmatyDateString(iso: string): string {
  // Convert an ISO timestamp to its YYYY-MM-DD in Asia/Almaty
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Almaty",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${day}`;
}

export default async function EventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);

  const sp = await searchParams;
  const dateRaw = sp?.date;
  const dateStr =
    typeof dateRaw === "string" && DATE_PARAM_RE.test(dateRaw) ? dateRaw : null;

  const allEvents = await loadEvents();

  const events = dateStr
    ? allEvents.filter((e) => toAlmatyDateString(e.start_date) === dateStr)
    : allEvents;

  const dateLabel = dateStr
    ? new Date(dateStr + "T00:00:00").toLocaleDateString(
        locale === "kk" ? "kk-KZ" : "ru-RU",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : null;

  const filterLabel = locale === "kk" ? "Күні бойынша сүзгі" : "Фильтр по дате";
  const resetLabel = locale === "kk" ? "Сүзгіні тазарту" : "Сбросить фильтр";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{messages.events.title}</h1>

      {dateStr && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <span className="text-sm text-gray-700">
            <span className="font-medium">{filterLabel}:</span> {dateLabel}
          </span>
          <Link
            href={`/${locale}/events`}
            className="ml-auto inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {resetLabel}
          </Link>
        </div>
      )}

      <EventCalendar locale={locale} initialEvents={events} />
    </div>
  );
}
