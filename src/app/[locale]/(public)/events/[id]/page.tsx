import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  isValidLocale,
  type Locale,
  getMessages,
  getLocalizedField,
} from "@/lib/i18n";
import { getOne } from "@/lib/db";
import { eventImage } from "@/lib/event-image";
import DgPageHero from "@/components/layout/DgPageHero";
import DgIcon from "@/components/layout/DgIcon";
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

const TYPE_LABELS: Record<string, Record<Locale, string>> = {
  concert: { kk: "Концерт", ru: "Концерт" },
  exhibition: { kk: "Көрме", ru: "Выставка" },
  workshop: { kk: "Шеберхана", ru: "Мастер-класс" },
  festival: { kk: "Фестиваль", ru: "Фестиваль" },
  competition: { kk: "Байқау", ru: "Конкурс" },
  other: { kk: "Басқа", ru: "Другое" },
};

function getBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  return (env || "https://dvorets-gornyakov.kz").replace(/\/$/, "");
}

/** Asia/Almaty-aware full date+time label */
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

/** Short "22 марта 2026" / "22 наурыз 2026" for tag line */
function formatShortDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(
    locale === "kk" ? "kk-KZ" : "ru-RU",
    { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Almaty" }
  );
}

// ── generateMetadata (preserves per-event og:image) ─────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: lp, id } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const event = (await loadEvent(id)) ?? DEMO_EVENTS[id];
  if (!event) return {};

  const title = getLocalizedField(
    event as unknown as Record<string, unknown>,
    "title",
    locale
  );
  const description =
    getLocalizedField(
      event as unknown as Record<string, unknown>,
      "description",
      locale
    ) || title;
  const cover = eventImage(event.image_url, event.event_type);
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/${locale}/events/${id}`;
  const ogImage = cover.startsWith("http") ? cover : `${baseUrl}${cover}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 675, alt: title }],
    },
    alternates: {
      canonical,
      languages: {
        kk: `${baseUrl}/kk/events/${id}`,
        ru: `${baseUrl}/ru/events/${id}`,
      },
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);
  const t = messages.events;
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const event = (await loadEvent(id)) ?? DEMO_EVENTS[id];
  if (!event) {
    notFound();
  }

  const title = getLocalizedField(
    event as unknown as Record<string, unknown>,
    "title",
    locale
  );
  const description = getLocalizedField(
    event as unknown as Record<string, unknown>,
    "description",
    locale
  );
  const typeLabel =
    TYPE_LABELS[event.event_type]?.[locale] || event.event_type;

  const startLabel = formatAlmaty(event.start_date, locale);
  const endLabel = event.end_date
    ? formatAlmaty(event.end_date, locale)
    : null;
  const shortDate = formatShortDate(event.start_date, locale);
  const cover = eventImage(event.image_url, event.event_type);

  return (
    <div className="dg-home">
      <DgPageHero
        crumbs={[
          { label: T("Басты бет", "Главная"), href: `/${locale}` },
          { label: T("Афиша", "Афиша"), href: `/${locale}/events` },
          { label: title },
        ]}
        tag={`${typeLabel} · ${shortDate}`}
        h2Html={title}
      />

      <section className="section" style={{ borderTop: 0 }}>
        <div className="dg-wrap">
          <div className="detail-grid">
            {/* ── Main column ─────────────────────────────────────── */}
            <main>
              <div className="detail-cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt={title} />
              </div>

              <ul className="feature-meta" style={{ marginTop: 28 }}>
                <li>
                  <span className="lab">
                    <DgIcon name="calendar" size={16} />
                    {T("Күні / уақыты", "Дата / время")}
                  </span>
                  <span className="val">
                    {startLabel}
                    {endLabel ? ` — ${endLabel}` : ""}
                  </span>
                </li>
                {event.location && (
                  <li>
                    <span className="lab">
                      <DgIcon name="pin" size={16} />
                      {T("Орын / зал", "Место / зал")}
                    </span>
                    <span className="val">{event.location}</span>
                  </li>
                )}
                <li>
                  <span className="lab">
                    <DgIcon name="coin" size={16} />
                    {T("Кіру", "Стоимость")}
                  </span>
                  <span className="val price">
                    {T("Тегін", "Бесплатно")}
                  </span>
                </li>
              </ul>

              {description && (
                <div className="dg-prose" style={{ marginTop: 32 }}>
                  <p>{description}</p>
                </div>
              )}
            </main>

            {/* ── Aside ───────────────────────────────────────────── */}
            <aside className="detail-aside">
              <h3>
                {T("Іс-шара туралы еске салу", "Напоминание о событии")}
              </h3>
              <EventSubscribe
                eventId={event.id}
                locale={locale}
                labels={{
                  subscribe: t.subscribe,
                  subscribeSuccess: t.subscribeSuccess,
                }}
              />
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
