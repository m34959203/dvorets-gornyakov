import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMessages, isValidLocale, type Locale, getLocalizedField } from "@/lib/i18n";
import { getOne, getMany } from "@/lib/db";
import type { Hall } from "@/lib/rent/types";
import AvailabilityCalendar from "@/components/rent/AvailabilityCalendar";
import RentalRequestForm from "@/components/rent/RentalRequestForm";

export const dynamic = "force-dynamic";

const DEMO_HALLS: Record<string, Hall> = {
  grand: {
    id: "demo-grand",
    slug: "grand",
    name_kk: "Үлкен концерт залы",
    name_ru: "Большой концертный зал",
    description_kk:
      "Сарайдың басты залы — кең сахна, кәсіби дыбыс және жарық жүйелері, балкон. Концерт, фестиваль және үлкен іс-шараларға ыңғайлы.",
    description_ru:
      "Главный зал дворца — просторная сцена, профессиональный звук и свет, балкон. Подходит для концертов, фестивалей и крупных мероприятий.",
    capacity: 650,
    equipment_kk: ["Кәсіби дыбыс жүйесі", "Сахналық жарық", "LED-экран", "3 гримёрка", "Wi-Fi", "Кондиционер"],
    equipment_ru: ["Профессиональный звук", "Сценический свет", "LED-экран", "3 гримёрки", "Wi-Fi", "Кондиционер"],
    hourly_price: 0,
    event_price_from: 0,
    photos: [{ url: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1600&q=80", alt_ru: "Большой зал", alt_kk: "Үлкен зал" }],
    layout_url: null,
    is_active: true,
    sort_order: 10,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  chamber: {
    id: "demo-chamber",
    slug: "chamber",
    name_kk: "Камералық зал",
    name_ru: "Камерный зал",
    description_kk:
      "Акустикалық ортасы жақсы шағын зал. Камералық концерт, презентация, лекция, қонақ жиналыстарына ыңғайлы.",
    description_ru:
      "Небольшой зал с хорошей акустикой. Подходит для камерных концертов, презентаций, лекций и встреч.",
    capacity: 120,
    equipment_kk: ["Акустикалық жүйе", "Проектор", "Экран", "Wi-Fi", "Сахна"],
    equipment_ru: ["Акустическая система", "Проектор", "Экран", "Wi-Fi", "Сцена"],
    hourly_price: 0,
    event_price_from: 0,
    photos: [{ url: "https://images.unsplash.com/photo-1519683109079-d5f539e1542f?w=1600&q=80", alt_ru: "Камерный зал", alt_kk: "Камералық зал" }],
    layout_url: null,
    is_active: true,
    sort_order: 20,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  rehearsal: {
    id: "demo-rehearsal",
    slug: "rehearsal",
    name_kk: "Жаттығу залы",
    name_ru: "Репетиционный зал",
    description_kk:
      "Айна қабырғалы, таза еденді жаттығу залы. Би, вокал және театр ұжымдарына арналған.",
    description_ru:
      "Зал с зеркальной стеной и ровным полом. Для танцевальных, вокальных и театральных репетиций.",
    capacity: 40,
    equipment_kk: ["Айналар", "Станок", "Пианино", "Дыбыс жүйесі", "Киім ауыстыру бөлмесі"],
    equipment_ru: ["Зеркала", "Станок", "Пианино", "Аудио-система", "Раздевалка"],
    hourly_price: 0,
    event_price_from: 0,
    photos: [{ url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80", alt_ru: "Репетиционный зал", alt_kk: "Жаттығу залы" }],
    layout_url: null,
    is_active: true,
    sort_order: 30,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
};

async function loadHall(slug: string): Promise<Hall | null> {
  try {
    const row = await getOne<Hall>(
      `SELECT * FROM halls WHERE slug = $1 AND is_active = TRUE`,
      [slug]
    );
    if (row) return row;
  } catch {}
  return DEMO_HALLS[slug] ?? null;
}

async function loadAllHalls(): Promise<Hall[]> {
  try {
    const rows = await getMany<Hall>(
      `SELECT * FROM halls WHERE is_active = TRUE ORDER BY sort_order ASC`
    );
    if (rows.length) return rows;
  } catch {}
  return Object.values(DEMO_HALLS);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: lp, slug } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const hall = await loadHall(slug);
  if (!hall) return { title: "Not found" };
  const name = getLocalizedField(hall, "name", locale);
  const desc = getLocalizedField(hall, "description", locale);
  return { title: `${name} — ${locale === "kk" ? "Залды жалдау" : "Аренда зала"}`, description: desc };
}

export default async function HallPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: lp, slug } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const messages = getMessages(locale);
  const t = messages.rent as unknown as Record<string, unknown>;

  const hall = await loadHall(slug);
  if (!hall) notFound();

  const halls = await loadAllHalls();
  const name = getLocalizedField(hall, "name", locale);
  const description = getLocalizedField(hall, "description", locale);
  const equipment = (locale === "kk" ? hall.equipment_kk : hall.equipment_ru) ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name,
    description,
    maximumAttendeeCapacity: hall.capacity,
    address: {
      "@type": "PostalAddress",
      streetAddress: locale === "kk" ? "Абай д-лы, 10" : "пр. К.И. Сатпаева, 106",
      addressLocality: "Сатпаев",
      addressCountry: "KZ",
    },
  };

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header / cover */}
      <section className="relative isolate overflow-hidden bg-primary-dark text-white">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              `linear-gradient(180deg, rgba(9,84,86,0.75) 0%, rgba(26,26,46,0.85) 100%), url(${hall.photos?.[0]?.url ?? "/hero/hero.jpg"})`,
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:py-24">
          <nav className="mb-5 text-xs text-white/70">
            <Link href={`/${locale}`} className="hover:text-white">{String(t.breadcrumbHome)}</Link>
            <span className="mx-2">/</span>
            <Link href={`/${locale}/rent`} className="hover:text-white">{String(t.breadcrumbHere)}</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{name}</span>
          </nav>
          <h1 className="text-4xl font-bold sm:text-5xl">{name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/85">
            <span className="rounded-full bg-white/15 px-3 py-1">
              {String(t.detailCapacity)}: {hall.capacity}
            </span>
            <span className="rounded-full bg-accent/90 px-3 py-1 font-semibold text-primary-dark">
              {locale === "kk" ? "Тегін" : "Бесплатно"}
            </span>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Link href={`/${locale}/rent`} className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {String(t.detailBack)}
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{String(t.detailDescription)}</h2>
            <p className="mt-3 whitespace-pre-line text-gray-700">{description}</p>

            <h3 className="mt-10 text-xl font-bold text-gray-900">{String(t.detailEquipment)}</h3>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {equipment.map((item, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-800">{item}</span>
                </li>
              ))}
            </ul>

            {hall.photos && hall.photos.length > 1 && (
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {hall.photos.slice(1).map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={p.url}
                       alt={(locale === "kk" ? p.alt_kk : p.alt_ru) || name}
                       className="aspect-[4/3] w-full rounded-xl object-cover" />
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-lg">
              <div className="text-sm uppercase tracking-wide text-white/70">
                {String(t.detailEvent)}
              </div>
              <div className="mt-1 text-3xl font-bold">
                {locale === "kk" ? "Тегін" : "Бесплатно"}
              </div>
              <a href="#book"
                 className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-primary-dark transition hover:bg-accent-light">
                {String(t.heroCta)}
              </a>
            </div>
            <AvailabilityCalendar
              halls={[hall]}
              locale={locale}
              labels={{
                selectHall: String(t.calendarSelectHall),
                busy: String(t.calendarBusy),
                free: String(t.calendarFree),
                onRequest: String(t.calendarOnRequest),
                monthFormat: { month: "long", year: "numeric" },
              }}
            />
          </aside>
        </div>
      </section>

      {/* Booking form */}
      <section id="book" className="bg-[color:var(--background)] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <RentalRequestForm
            halls={halls}
            locale={locale}
            defaultHallId={hall.id}
            labels={{
              title: String(t.formTitle),
              hall: String(t.formHall),
              name: String(t.formName),
              phone: String(t.formPhone),
              email: String(t.formEmail),
              date: String(t.formDate),
              timeFrom: String(t.formTimeFrom),
              timeTo: String(t.formTimeTo),
              guests: String(t.formGuests),
              eventType: String(t.formEventType),
              equipment: String(t.formEquipment),
              message: String(t.formMessage),
              submit: String(t.formSubmit),
              submitting: String(t.formSubmitting),
              success: String(t.formSuccess),
              error: String(t.formError),
              eventTypes: t.formEventTypes as Record<string, string>,
              equipmentOptions: t.formEquipmentOptions as Record<
                "mic" | "projector" | "lights" | "streaming" | "catering",
                string
              >,
            }}
          />
        </div>
      </section>
    </div>
  );
}
