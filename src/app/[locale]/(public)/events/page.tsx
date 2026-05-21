import type { Metadata } from "next";
import { isValidLocale, type Locale, getLocalizedField } from "@/lib/i18n";
import { getMany } from "@/lib/db";
import EtnoHeroStrip from "@/components/features/EtnoHeroStrip";
import EventsCatalog, { type CatalogItem } from "@/components/features/EventsCatalog";

export const dynamic = "force-dynamic";

const SITE_NAME_KK = "Ш. Ділдебаев атындағы тау-кенші сарайы";
const SITE_NAME_RU = "Дворец горняков им. Ш. Дільдебаева";

const MONTHS_KK = ["қаң.", "ақп.", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыр.", "қаз.", "қар.", "жел."];
const MONTHS_RU = ["янв.", "фев.", "марта", "апр.", "мая", "июн.", "июл.", "авг.", "сен.", "окт.", "ноя.", "дек."];
const MONTHS_KK_FULL = ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"];
const MONTHS_RU_FULL = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];

function buildKicker(events: { start_date: string }[], locale: Locale): string {
  if (!events.length) {
    const now = new Date();
    const monthsFull = locale === "kk" ? MONTHS_KK_FULL : MONTHS_RU_FULL;
    return `${(locale === "kk" ? "Афиша · " : "Афиша · ")}${capitalize(monthsFull[now.getMonth()])} ${now.getFullYear()}`;
  }
  const dates = events.map((e) => new Date(e.start_date));
  const min = dates.reduce((a, b) => (a < b ? a : b));
  const max = dates.reduce((a, b) => (a > b ? a : b));
  const monthsFull = locale === "kk" ? MONTHS_KK_FULL : MONTHS_RU_FULL;
  const minM = capitalize(monthsFull[min.getMonth()]);
  const maxM = capitalize(monthsFull[max.getMonth()]);
  const year = max.getFullYear();
  const range = min.getMonth() === max.getMonth() ? minM : `${minM} — ${maxM}`;
  return `${locale === "kk" ? "Афиша · " : "Афиша · "}${range} ${year}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TYPE_TO_CAT_KK: Record<string, string> = {
  concert: "Концерт",
  theater: "Театр",
  workshop: "Шеберлік",
  exhibition: "Көрме",
  festival: "Фестиваль",
  other: "Басқа",
};
const TYPE_TO_CAT_RU: Record<string, string> = {
  concert: "Концерт",
  theater: "Театр",
  workshop: "Мастер-класс",
  exhibition: "Выставка",
  festival: "Фестиваль",
  other: "Прочее",
};

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
      : `Афиша — ${SITE_NAME_RU}`;
  const description =
    locale === "kk"
      ? "Концерттер, спектакльдер, шеберханалар мен фестивальдер афишасы — Сатпаев қаласы."
      : "Афиша концертов, спектаклей, мастер-классов и фестивалей — г. Сатпаев.";
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/${locale}/events`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [] },
    alternates: {
      canonical,
      languages: {
        kk: `${baseUrl}/kk/events`,
        ru: `${baseUrl}/ru/events`,
      },
    },
  };
}

interface EventRow {
  id: string;
  title_kk: string;
  title_ru: string;
  description_kk: string;
  description_ru: string;
  image_url: string | null;
  event_type: string;
  start_date: string;
  location: string;
}

const demoEvents: EventRow[] = [
  { id: "e1", title_kk: "Концерт «Көктем әуені»", title_ru: "Концерт «Мелодии весны»", description_kk: "", description_ru: "", image_url: null, event_type: "concert", start_date: "2026-03-12T19:00:00Z", location: "Үлкен зал" },
  { id: "e2", title_kk: "«Тұмар» хореографиялық қойылым", title_ru: "Хореографическая постановка «Тумар»", description_kk: "", description_ru: "", image_url: null, event_type: "concert", start_date: "2026-03-15T18:00:00Z", location: "Үлкен зал" },
  { id: "e3", title_kk: "«Абай жолы» спектаклі", title_ru: "Спектакль «Путь Абая»", description_kk: "", description_ru: "", image_url: null, event_type: "theater", start_date: "2026-03-16T18:00:00Z", location: "Үлкен зал" },
  { id: "e4", title_kk: "Қыш илеу шеберлік сабағы", title_ru: "Мастер-класс по гончарному делу", description_kk: "", description_ru: "", image_url: null, event_type: "workshop", start_date: "2026-03-17T11:00:00Z", location: "Студия №3" },
  { id: "e5", title_kk: "Айтыс — Арқа айтысы", title_ru: "Айтыс — состязание акынов", description_kk: "", description_ru: "", image_url: null, event_type: "concert", start_date: "2026-03-19T18:30:00Z", location: "Үлкен зал" },
  { id: "e6", title_kk: "«Менің Сатпаев» сурет көрмесі", title_ru: "Выставка «Мой Сатпаев»", description_kk: "", description_ru: "", image_url: null, event_type: "exhibition", start_date: "2026-03-20T14:00:00Z", location: "Фойе" },
  { id: "e7", title_kk: "«Наурыз думан» — қала концерті", title_ru: "Городской концерт «Наурыз»", description_kk: "", description_ru: "", image_url: null, event_type: "concert", start_date: "2026-03-22T18:00:00Z", location: "Үлкен зал" },
  { id: "e8", title_kk: "Балалар театры «Қарлығаш»", title_ru: "Детский театр «Карлыгаш»", description_kk: "", description_ru: "", image_url: null, event_type: "theater", start_date: "2026-03-24T12:00:00Z", location: "Камералық" },
  { id: "e9", title_kk: "Ою-өрнек шеберлік сабағы", title_ru: "Мастер-класс по орнаменту", description_kk: "", description_ru: "", image_url: null, event_type: "workshop", start_date: "2026-03-25T15:00:00Z", location: "Студия №2" },
  { id: "e10", title_kk: "«Қара жорға» этно-кеш", title_ru: "Этно-вечер «Қара жорға»", description_kk: "", description_ru: "", image_url: null, event_type: "concert", start_date: "2026-03-28T19:00:00Z", location: "Үлкен зал" },
  { id: "e11", title_kk: "Жас суретшілер фестивалі", title_ru: "Фестиваль юных художников", description_kk: "", description_ru: "", image_url: null, event_type: "exhibition", start_date: "2026-03-30T11:00:00Z", location: "Фойе" },
  { id: "e12", title_kk: "Көктем фестивалі — гала", title_ru: "Гала-концерт фестиваля «Весна»", description_kk: "", description_ru: "", image_url: null, event_type: "festival", start_date: "2026-04-05T19:00:00Z", location: "Үлкен зал" },
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
    return rows.length ? rows : demoEvents;
  } catch {
    return demoEvents;
  }
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const events = await loadEvents();
  const months = locale === "kk" ? MONTHS_KK : MONTHS_RU;
  const typeMap = locale === "kk" ? TYPE_TO_CAT_KK : TYPE_TO_CAT_RU;

  const items: CatalogItem[] = events.map((e) => {
    const d = new Date(e.start_date);
    // Asia/Almaty, иначе в UTC-контейнере дата и время съезжают (час «04:00»).
    const dp = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Almaty",
      day: "numeric",
      month: "numeric",
    }).formatToParts(d);
    const dayNum = dp.find((p) => p.type === "day")?.value ?? "";
    const monthIdx = Number(dp.find((p) => p.type === "month")?.value ?? "1") - 1;
    return {
      title: getLocalizedField(e as unknown as Record<string, unknown>, "title", locale),
      date: `${dayNum} ${months[monthIdx]}`,
      time: d.toLocaleTimeString(locale === "kk" ? "kk-KZ" : "ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Almaty",
      }),
      hall: e.location,
      price: T("Тегін", "Бесплатно"),
      free: true,
      cat: typeMap[e.event_type] ?? typeMap.other,
      href: `/${locale}/events/${e.id}`,
    };
  });

  // Фильтр-категории — только те, что реально присутствуют в данных
  const presentCats = Array.from(new Set(items.map((i) => i.cat)));
  const orderedCats = [
    T("Барлығы", "Все"),
    ...["Концерт", "Театр", T("Шеберлік", "Мастер-класс"), T("Көрме", "Выставка"), "Фестиваль", T("Басқа", "Прочее")].filter(
      (c) => presentCats.includes(c)
    ),
  ];

  return (
    <>
      <EtnoHeroStrip
        kicker={buildKicker(events, locale)}
        title={
          <>
            {T("Барлық ", "Все ")}
            <span style={{ color: "var(--emerald)" }}>
              {T("іс-шаралар", "события")}
            </span>
          </>
        }
      />
      <EventsCatalog locale={locale} items={items} cats={orderedCats} perPage={12} />
    </>
  );
}
