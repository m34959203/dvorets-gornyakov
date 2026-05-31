import type { Metadata } from "next";
import { getSiteBaseUrl } from "@/lib/site-url";
import { isValidLocale, type Locale, getLocalizedField } from "@/lib/i18n";
import { getMany } from "@/lib/db";
import { eventImage } from "@/lib/event-image";
import { localizeVenue, type VenuePair } from "@/lib/venue";
import DgPageHero from "@/components/layout/DgPageHero";
import DgEventsCatalog, { type DgEvent } from "@/components/features/DgEventsCatalog";

export const dynamic = "force-dynamic";


const MONTHS_KK_FULL = ["Қаңтар", "Ақпан", "Наурыз", "Сәуір", "Мамыр", "Маусым", "Шілде", "Тамыз", "Қыркүйек", "Қазан", "Қараша", "Желтоқсан"];
const MONTHS_RU_FULL = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const SHORT_KK = ["ҚАҢ", "АҚП", "НАУ", "СӘУ", "МАМ", "МАУ", "ШІЛ", "ТАМ", "ҚЫР", "ҚАЗ", "ҚАР", "ЖЕЛ"];
const SHORT_RU = ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЯ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"];

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


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: lp } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  // Короткая метка — название сарая/города добавит template из layout
  const title = locale === "kk" ? "Іс-шаралар" : "Афиша";
  const description =
    locale === "kk"
      ? "Концерттер, спектакльдер, шеберханалар мен фестивальдер афишасы — Сәтбаев қаласы."
      : "Афиша концертов, спектаклей, мастер-классов и фестивалей — г. Сатпаев.";
  const baseUrl = await getSiteBaseUrl();
  const canonical = `${baseUrl}/${locale}/events`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [{ url: "/photos/og-cover.jpg", width: 1200, height: 630 }] },
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
          AND start_date >= NOW()
        ORDER BY start_date ASC
        LIMIT 60`
    );
    return rows.length ? rows : demoEvents;
  } catch {
    return demoEvents;
  }
}

// Пары kk↔ru для локализации events.location (свободный текст, не FK на halls).
async function loadHallPairs(): Promise<VenuePair[]> {
  try {
    return await getMany<VenuePair>(`SELECT name_kk AS kk, name_ru AS ru FROM halls`);
  } catch {
    return [];
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

  const [events, hallPairs] = await Promise.all([loadEvents(), loadHallPairs()]);
  const shortMonths = locale === "kk" ? SHORT_KK : SHORT_RU;
  const longMonths = locale === "kk" ? MONTHS_KK_FULL : MONTHS_RU_FULL;
  const typeMap = locale === "kk" ? TYPE_TO_CAT_KK : TYPE_TO_CAT_RU;

  // Фильтр по месяцу: текущий + 2 следующих (Asia/Almaty), а не то, что в данных.
  const curMonthIdx =
    Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Almaty", month: "numeric" }).format(new Date())) - 1;
  const monthWindow = [0, 1, 2].map((o) => longMonths[(curMonthIdx + o) % 12]);

  const items: DgEvent[] = events.map((e) => {
    const d = new Date(e.start_date);
    // Asia/Almaty, иначе в UTC-контейнере дата и время съезжают (час «04:00»).
    const dp = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Almaty",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).formatToParts(d);
    const dayNum = dp.find((p) => p.type === "day")?.value ?? "";
    const monthNum = dp.find((p) => p.type === "month")?.value ?? "1";
    const monthIdx = Number(monthNum) - 1;
    const year = dp.find((p) => p.type === "year")?.value ?? "";
    const iso = `${year}-${monthNum.padStart(2, "0")}-${dayNum.padStart(2, "0")}`;
    return {
      id: e.id,
      href: `/${locale}/events/${e.id}`,
      title: getLocalizedField(e as unknown as Record<string, unknown>, "title", locale),
      image: eventImage(e.image_url, e.event_type),
      iso,
      day: dayNum,
      mon: shortMonths[monthIdx],
      monthLong: longMonths[monthIdx],
      year,
      time: d.toLocaleTimeString(locale === "kk" ? "kk-KZ" : "ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Almaty",
      }),
      hall: localizeVenue(e.location, locale, hallPairs),
      type: typeMap[e.event_type] ?? typeMap.other,
      free: true,
      price: T("Тегін", "Бесплатно"),
      tag: typeMap[e.event_type] ?? typeMap.other,
    };
  });

  return (
    <div className="dg-home">
      <a href="#grid" className="dg-skip-link">{T("Афишаға өту", "Перейти к афише")}</a>
      <DgPageHero
        crumbs={[
          { label: T("Басты бет", "Главная"), href: `/${locale}` },
          { label: T("Афиша", "Афиша") },
        ]}
        tag={T("— Афиша · 2026 —", "— Афиша · 2026 —")}
        h2Html={T("Сарайдың барлық <strong>іс-шаралары</strong>", "Все мероприятия <strong>Дворца</strong>")}
        lead={T(
          "Сәтбаев тау-кеншілер сарайының концерттері, спектакльдері, шеберлік сабақтары мен көрмелері. Ай, зал немесе түрі бойынша сүзіңіз.",
          "Концерты, спектакли, мастер-классы, выставки и конкурсы Дворца горняков. Фильтруйте по месяцу, залу или типу события."
        )}
      />
      <DgEventsCatalog locale={locale} items={items} monthWindow={monthWindow} />
    </div>
  );
}
