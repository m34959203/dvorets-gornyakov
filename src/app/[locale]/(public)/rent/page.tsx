import type { Metadata } from "next";
import Link from "next/link";
import { getMessages, isValidLocale, type Locale } from "@/lib/i18n";
import { getMany } from "@/lib/db";
import type { Hall } from "@/lib/rent/types";
import HallCard from "@/components/rent/HallCard";
import AvailabilityCalendar from "@/components/rent/AvailabilityCalendar";
import RentalRequestForm from "@/components/rent/RentalRequestForm";
import RentFAQ from "@/components/rent/RentFAQ";
import RentalChecklist from "@/components/features/RentalChecklist";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: lp } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const m = getMessages(locale);
  const r = m.rent as unknown as Record<string, string>;
  return {
    title: r.metaTitle,
    description: r.metaDescription,
    openGraph: { title: r.metaTitle, description: r.metaDescription },
  };
}

async function loadHalls(): Promise<Hall[]> {
  try {
    return await getMany<Hall>(
      `SELECT id, slug, name_kk, name_ru, description_kk, description_ru,
              capacity, equipment_kk, equipment_ru, hourly_price, event_price_from,
              photos, layout_url, is_active, sort_order, created_at, updated_at
         FROM halls WHERE is_active = TRUE ORDER BY sort_order ASC, name_ru ASC`
    );
  } catch {
    // DB not available — fallback to empty list; page still renders
    return [];
  }
}

export default async function RentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: lp } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const messages = getMessages(locale);
  const t = messages.rent as unknown as Record<string, unknown>;

  const halls = await loadHalls();

  const faq = (t.faq as { q: string; a: string }[]) ?? [];

  const rentalChecklistMessages = messages.rental as unknown as Parameters<typeof RentalChecklist>[0]["messages"];

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-primary-dark text-white">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(9,84,86,0.92) 0%, rgba(13,115,119,0.75) 50%, rgba(26,26,46,0.9) 100%), url(/hero/hero.jpg)",
          }}
        />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-28 lg:py-32">
          <nav className="mb-6 text-xs text-white/70" aria-label="breadcrumb">
            <Link href={`/${locale}`} className="hover:text-white">
              {String(t.breadcrumbHome)}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{String(t.breadcrumbHere)}</span>
          </nav>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-white/90 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {String(t.heroBadge)}
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {String(t.heroTitle)}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">{String(t.heroLead)}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#request"
               className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-primary-dark shadow-lg shadow-accent/20 transition hover:bg-accent-light">
              {String(t.heroCta)}
            </a>
            <a href="#halls"
               className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20">
              {String(t.heroScroll)}
            </a>
          </div>
        </div>
      </section>

      {/* Halls */}
      <section id="halls" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{String(t.hallsTitle)}</h2>
          <p className="mt-3 text-lg text-gray-600">{String(t.hallsLead)}</p>
        </div>
        {halls.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {halls.map((h) => (
              <HallCard
                key={h.id}
                hall={h}
                locale={locale}
                labels={{
                  capacity: String(t.hallCapacity),
                  from: String(t.hallFrom),
                  currency: String(t.hallCurrency),
                  details: String(t.hallDetails),
                }}
              />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-gray-500">—</p>
        )}
      </section>

      {/* Checklist (reuse) */}
      <RentalChecklist locale={locale} messages={rentalChecklistMessages} />

      {/* Calendar */}
      {halls.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{String(t.calendarTitle)}</h2>
              <p className="mt-3 text-gray-600">{String(t.calendarLead)}</p>
            </div>
            <div className="mt-10">
              <AvailabilityCalendar
                halls={halls}
                locale={locale}
                labels={{
                  selectHall: String(t.calendarSelectHall),
                  busy: String(t.calendarBusy),
                  free: String(t.calendarFree),
                  onRequest: String(t.calendarOnRequest),
                  monthFormat: { month: "long", year: "numeric" },
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <RentFAQ title={String(t.faqTitle)} items={faq} />

      {/* Request form */}
      <section id="request" className="bg-[color:var(--background)] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {halls.length > 0 ? (
            <RentalRequestForm
              halls={halls}
              locale={locale}
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
          ) : (
            <p className="text-center text-gray-500">—</p>
          )}
        </div>
      </section>
    </div>
  );
}
