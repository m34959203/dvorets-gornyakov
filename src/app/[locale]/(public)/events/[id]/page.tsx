import Link from "next/link";
import { notFound } from "next/navigation";
import {
  isValidLocale,
  type Locale,
  getMessages,
  getLocalizedField,
} from "@/lib/i18n";
import { getOne } from "@/lib/db";
import Badge from "@/components/ui/Badge";
import EventSubscribe from "@/components/features/EventSubscribe";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type EventRow = {
  id: string;
  title_kk: string;
  title_ru: string;
  description_kk: string | null;
  description_ru: string | null;
  image_url: string | null;
  event_type: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  status: string;
};

async function loadEvent(id: string): Promise<EventRow | null> {
  if (!UUID_RE.test(id)) return null;
  try {
    return await getOne<EventRow>(
      `SELECT id, title_kk, title_ru, description_kk, description_ru,
              image_url, event_type, start_date, end_date, location, status
         FROM events
        WHERE id = $1`,
      [id]
    );
  } catch {
    return null;
  }
}

const DEMO_EVENTS: Record<string, EventRow> = {
  "1": {
    id: "1",
    title_kk: "Наурыз мерекесіне арналған концерт",
    title_ru: "Симфонический концерт к Наурызу",
    description_kk:
      "Көктем мерекесіне арналған мерекелік концерт. Өнер бағытындағы ансамбльдер мен жас солистер қатысады.",
    description_ru:
      "Праздничный концерт, посвящённый Наурызу. Выступления творческих коллективов дворца, ансамбля «Арман» и юных солистов.",
    image_url: null,
    event_type: "concert",
    start_date: "2026-04-22T18:00:00+06:00",
    end_date: null,
    location: "Главный зал",
    status: "upcoming",
  },
  "2": {
    id: "2",
    title_kk: "Қазақ поэзиясы кеші",
    title_ru: "Вечер казахской поэзии",
    description_kk:
      "Шынболат Ділдебаев мұрасына арналған поэзия кеші. Ақындар мен термешілер сөз сөйлейді.",
    description_ru:
      "Поэтический вечер, посвящённый наследию Шынболата Дильдебаева. Выступления местных акынов и термеши.",
    image_url: null,
    event_type: "other",
    start_date: "2026-05-05T19:00:00+06:00",
    end_date: null,
    location: "Камерный зал",
    status: "upcoming",
  },
  "3": {
    id: "3",
    title_kk: "Балалар би шеберханасы",
    title_ru: "Танцевальный мастер-класс для детей",
    description_kk:
      "5–12 жас аралығындағы балаларға арналған тегін би шеберханасы. Заманауи және халық билері.",
    description_ru:
      "Бесплатный мастер-класс для детей 5–12 лет. Современные и народные танцы, руководитель — Динара Маратқызы.",
    image_url: null,
    event_type: "workshop",
    start_date: "2026-05-15T14:00:00+06:00",
    end_date: null,
    location: "Репетиционный зал",
    status: "upcoming",
  },
  "4": {
    id: "4",
    title_kk: "Жас суретшілер көрмесі",
    title_ru: "Выставка юных художников",
    description_kk:
      "Сәтбаев қаласының оқушыларының шығармашылық жұмыстары — сурет, графика, керамика.",
    description_ru:
      "Итоговая выставка работ воспитанников изостудии — рисунок, графика, керамика.",
    image_url: null,
    event_type: "exhibition",
    start_date: "2026-06-01T10:00:00+06:00",
    end_date: "2026-06-14T18:00:00+06:00",
    location: "Галерея",
    status: "upcoming",
  },
};

const FALLBACK_IMG: Record<string, string> = {
  concert: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1600&q=80",
  exhibition: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=1600&q=80",
  workshop: "https://images.unsplash.com/photo-1472162314594-eca3be56d8f4?w=1600&q=80",
  festival: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&q=80",
  competition: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1600&q=80",
  other: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1600&q=80",
};

const TYPE_LABELS: Record<string, Record<Locale, string>> = {
  concert: { kk: "Концерт", ru: "Концерт" },
  exhibition: { kk: "Көрме", ru: "Выставка" },
  workshop: { kk: "Шеберхана", ru: "Мастер-класс" },
  festival: { kk: "Фестиваль", ru: "Фестиваль" },
  competition: { kk: "Байқау", ru: "Конкурс" },
  other: { kk: "Басқа", ru: "Другое" },
};

function formatAlmaty(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleString(
    locale === "kk" ? "kk-KZ" : "ru-RU",
    {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Asia/Almaty",
    }
  );
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);
  const t = messages.events;

  const event = (await loadEvent(id)) ?? DEMO_EVENTS[id];
  if (!event) {
    notFound();
  }

  const title = getLocalizedField(event, "title", locale);
  const description = getLocalizedField(event, "description", locale);
  const typeLabel =
    TYPE_LABELS[event.event_type]?.[locale] || event.event_type;

  const startLabel = formatAlmaty(event.start_date, locale);
  const endLabel = event.end_date ? formatAlmaty(event.end_date, locale) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${locale}/events`}
        className="inline-flex items-center text-primary hover:text-primary-dark mb-6"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {messages.common.back}
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.image_url || FALLBACK_IMG[event.event_type] || FALLBACK_IMG.other}
          alt={title}
          className="w-full aspect-video object-cover"
        />

        <div className="p-6">
          <div className="flex items-start justify-between mb-4 gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <Badge variant="info">{typeLabel}</Badge>
          </div>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {startLabel}
                {endLabel ? ` — ${endLabel}` : ""}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <span>{event.location}</span>
              </div>
            )}
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <EventSubscribe
              eventId={event.id}
              locale={locale}
              labels={{
                subscribe: t.subscribe,
                subscribeSuccess: t.subscribeSuccess,
              }}
            />
            <span className="text-sm text-gray-500">
              {locale === "kk"
                ? "Іс-шара туралы еске салу алыңыз"
                : "Получите напоминание о мероприятии"}
            </span>
          </div>

          {description && (
            <div className="prose max-w-none text-gray-700 mb-8 whitespace-pre-wrap">
              <p>{description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
