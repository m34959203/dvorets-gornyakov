import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, type Locale, getLocalizedField, getMessages } from "@/lib/i18n";
import { getOne, getMany } from "@/lib/db";
import type { Hall } from "@/lib/rent/types";
import DgPageHero from "@/components/layout/DgPageHero";
import DgIcon from "@/components/layout/DgIcon";
import AvailabilityCalendar from "@/components/rent/AvailabilityCalendar";
import RentalRequestForm from "@/components/rent/RentalRequestForm";
import { getBotLinks } from "@/lib/rent/bot/links";

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
    photos: [{ url: "/photos/dvorets-08.webp", alt_ru: "Большой зал", alt_kk: "Үлкен зал" }],
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
    photos: [{ url: "/photos/dvorets-10.webp", alt_ru: "Камерный зал", alt_kk: "Камералық зал" }],
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
    photos: [{ url: "/photos/dvorets-12.webp", alt_ru: "Репетиционный зал", alt_kk: "Жаттығу залы" }],
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
  const name = getLocalizedField(hall as unknown as Record<string, unknown>, "name", locale);
  const desc = getLocalizedField(hall as unknown as Record<string, unknown>, "description", locale);
  return {
    title: `${name} — ${locale === "kk" ? "Залды жалдау" : "Аренда зала"}`,
    description: desc,
  };
}

export default async function HallPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: lp, slug } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const messages = getMessages(locale);
  const t = messages.rent as unknown as Record<string, unknown>;

  const hall = await loadHall(slug);
  if (!hall) notFound();

  const halls = await loadAllHalls();
  const botLinks = await getBotLinks(hall.slug);
  const hasBot = Boolean(botLinks.whatsapp);
  const name = getLocalizedField(hall as unknown as Record<string, unknown>, "name", locale);
  const description = getLocalizedField(hall as unknown as Record<string, unknown>, "description", locale);
  const equipment = (locale === "kk" ? hall.equipment_kk : hall.equipment_ru) ?? [];

  const coverUrl =
    hall.photos?.[0]?.url ||
    (slug === "grand"
      ? "/photos/dvorets-08.webp"
      : slug === "chamber"
      ? "/photos/dvorets-10.webp"
      : "/photos/dvorets-12.webp");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name,
    description,
    maximumAttendeeCapacity: hall.capacity,
    address: {
      "@type": "PostalAddress",
      streetAddress: T("Абай д-лы, 10", "пр. К.И. Сатпаева, 106"),
      addressLocality: "Сатпаев",
      addressCountry: "KZ",
    },
  };

  return (
    <div className="dg-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DgPageHero
        crumbs={[
          { label: T("Басты бет", "Главная"), href: `/${locale}` },
          { label: T("Зал жалдау", "Аренда залов"), href: `/${locale}/rent` },
          { label: name },
        ]}
        tag={T("— Зал —", "— Зал —")}
        h2Html={name}
        lead={description}
      />

      {/* Cover photo */}
      <section className="section" style={{ borderTop: 0, paddingBlock: 0 }}>
        <div className="dg-wrap">
          <div
            style={{
              borderRadius: "var(--dg-radius)",
              overflow: "hidden",
              aspectRatio: "16/7",
              background: "var(--dg-bg-2)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* Hall facts + calendar */}
      <section className="section">
        <div className="dg-wrap">
          <div className="hall-detail-grid">
            {/* Left: facts + equipment */}
            <div>
              <div className="section-bar" style={{ marginBottom: 28 }}>
                <div className="tag">{T("— Сипаттама —", "— Описание —")}</div>
                <h2 className="h2" dangerouslySetInnerHTML={{ __html: T("Залдың <strong>сипаттамасы</strong>", "<strong>Характеристики</strong> зала") }} />
              </div>

              <ul className="feature-meta">
                <li>
                  <span className="lab">
                    <DgIcon name="users" size={15} />
                    {T("Сыйымдылық", "Вместимость")}
                  </span>
                  <span className="val">{hall.capacity} {T("орын", "мест")}</span>
                </li>
                <li>
                  <span className="lab">
                    <DgIcon name="pin" size={15} />
                    {T("Орналасуы", "Расположение")}
                  </span>
                  <span className="val">
                    {T("Дворец горняков, Сәтбаев", "Дворец горняков, г. Сатпаев")}
                  </span>
                </li>
                <li>
                  <span className="lab">
                    <DgIcon name="coin" size={15} />
                    {T("Іс-шара құны", "Стоимость")}
                  </span>
                  <span className="val price">{T("Тегін", "Бесплатно")}</span>
                </li>
              </ul>

              {/* Equipment */}
              {equipment.length > 0 && (
                <div style={{ marginTop: 36 }}>
                  <div
                    style={{
                      fontSize: 10.5,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "var(--dg-text-3)",
                      marginBottom: 16,
                    }}
                  >
                    {String(t.detailEquipment)}
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: "10px 16px",
                    }}
                  >
                    {equipment.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontSize: 13.5,
                          color: "var(--dg-text-2)",
                          paddingBlock: 8,
                          borderBottom: "1px solid var(--dg-hair)",
                        }}
                      >
                        <span style={{ color: "var(--dg-accent)", flex: "none" }}>
                          <DgIcon name="arrow" size={13} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional photos */}
              {hall.photos && hall.photos.length > 1 && (
                <div
                  style={{
                    marginTop: 36,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: 12,
                  }}
                >
                  {hall.photos.slice(1).map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={p.url}
                      alt={(locale === "kk" ? p.alt_kk : p.alt_ru) || name}
                      style={{
                        aspectRatio: "4/3",
                        width: "100%",
                        objectFit: "cover",
                        borderRadius: "var(--dg-radius)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: sticky calendar + CTA */}
            <aside style={{ position: "sticky", top: 96 }}>
              <div
                style={{
                  background: "var(--dg-bg-2)",
                  border: "1px solid var(--dg-hair)",
                  borderRadius: "var(--dg-radius)",
                  padding: "24px",
                  marginBottom: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 10.5,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--dg-text-3)",
                  }}
                >
                  {String(t.detailEvent)}
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 500,
                    color: "var(--dg-accent)",
                  }}
                >
                  {T("Тегін", "Бесплатно")}
                </div>
                <a
                  href="#book"
                  className="dg-btn"
                  style={{ justifyContent: "center", width: "100%" }}
                >
                  <DgIcon name="calendar" size={16} />
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
        </div>
      </section>

      {/* Booking — через бота (с фолбэком на форму) */}
      <section id="book" className="section">
        <div className="dg-wrap">
          <div className="section-bar" style={{ marginBottom: 36 }}>
            <div className="tag">{T("— Өтінім —", "— Заявка —")}</div>
            <h2
              className="h2"
              dangerouslySetInnerHTML={{
                __html: hasBot
                  ? T("Ботта <strong>2 минутта брондаңыз</strong>", "Забронируйте <strong>за 2 минуты в боте</strong>")
                  : T("Зал <strong>жалдау өтінімі</strong>", "<strong>Заявка</strong> на аренду зала"),
              }}
            />
          </div>

          {hasBot ? (
            <div className="book-bot">
              <p className="book-bot-lead">
                {T(
                  "Бот залды, күнді мен уақытты сұрап, өтінімді әкімшіге жібереді. Ыңғайлы мессенджерді таңдаңыз:",
                  "Бот спросит зал, дату и время и отправит заявку администратору. Выберите удобный мессенджер:"
                )}
              </p>
              <div className="book-bot-btns">
                {botLinks.whatsapp && (
                  <a className="dg-btn book-wa" href={botLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                    <DgIcon name="phone" size={18} /> {T("WhatsApp арқылы брондау", "Забронировать в WhatsApp")}
                  </a>
                )}
              </div>
              <p className="book-bot-note">
                {T("Немесе кассаға қоңырау шалыңыз:", "Или позвоните в кассу:")}{" "}
                <a href="tel:+77106362440" style={{ color: "var(--dg-accent)" }}>+7 (71063) 6-24-40</a>
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </section>
    </div>
  );
}
