import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, type Locale, getLocalizedField } from "@/lib/i18n";
import { getMany } from "@/lib/db";
import type { Hall } from "@/lib/rent/types";
import DgPageHero from "@/components/layout/DgPageHero";
import DgIcon from "@/components/layout/DgIcon";
import RentBookingChat from "@/components/rent/RentBookingChat";

export const dynamic = "force-dynamic";

const DEMO_HALLS: Hall[] = [
  {
    id: "demo-grand",
    slug: "grand",
    name_kk: "Үлкен концерт залы",
    name_ru: "Большой концертный зал",
    description_kk: "Сарайдың басты залы — кең сахна, кәсіби дыбыс және жарық жүйелері, балкон. Концерт, фестиваль және үлкен іс-шараларға ыңғайлы.",
    description_ru: "Главный зал дворца — просторная сцена, профессиональный звук и свет, балкон. Подходит для концертов, фестивалей и крупных мероприятий.",
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
  {
    id: "demo-chamber",
    slug: "chamber",
    name_kk: "Камералық зал",
    name_ru: "Камерный зал",
    description_kk: "Акустикалық ортасы жақсы шағын зал. Камералық концерт, презентация, лекция, қонақ жиналыстарына ыңғайлы.",
    description_ru: "Небольшой зал с хорошей акустикой. Подходит для камерных концертов, презентаций, лекций и встреч.",
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
  {
    id: "demo-rehearsal",
    slug: "rehearsal",
    name_kk: "Жаттығу залы",
    name_ru: "Репетиционный зал",
    description_kk: "Айна қабырғалы, таза еденді жаттығу залы. Би, вокал және театр ұжымдарына арналған.",
    description_ru: "Зал с зеркальной стеной и ровным полом. Для танцевальных, вокальных и театральных репетиций.",
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
];

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://dvorets-gornyakov.kz").replace(/\/$/, "");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: lp } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const title = locale === "kk" ? "Залдарды жалдау" : "Аренда залов";
  const description =
    locale === "kk"
      ? "Сәтбаевта концерт, камералық және жаттығу залдарын жалдау. Онлайн өтінім."
      : "Аренда концертного, камерного и репетиционного залов в г. Сатпаев. Онлайн заявка.";
  const baseUrl = getBaseUrl();
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `${baseUrl}/${locale}/rent`,
      languages: { kk: `${baseUrl}/kk/rent`, ru: `${baseUrl}/ru/rent` },
    },
  };
}

async function loadHalls(): Promise<Hall[]> {
  try {
    const rows = await getMany<Hall>(
      `SELECT id, slug, name_kk, name_ru, description_kk, description_ru,
              capacity, equipment_kk, equipment_ru, hourly_price, event_price_from,
              photos, layout_url, is_active, sort_order, created_at, updated_at
         FROM halls WHERE is_active = TRUE ORDER BY sort_order ASC, name_ru ASC`
    );
    return rows.length ? rows : DEMO_HALLS;
  } catch {
    return DEMO_HALLS;
  }
}

export default async function RentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: lp } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const halls = await loadHalls();

  return (
    <div className="dg-home">
      <a href="#halls" className="dg-skip-link">{T("Залдар тізіміне өту", "Перейти к залам")}</a>

      <DgPageHero
        crumbs={[
          { label: T("Басты бет", "Главная"), href: `/${locale}` },
          { label: T("Зал жалдау", "Аренда залов") },
        ]}
        tag={T("— Залдар —", "— Залы —")}
        h2Html={T(
          "Іс-шараға <strong>зал жалдау</strong>",
          "<strong>Аренда</strong> залов"
        )}
        lead={T(
          "40, 120 және 650 орынға арналған үш зал. Дыбыс, жарық, сахна — бәрі дайын.",
          "Три зала на 40, 120 и 650 мест. Звук, свет, сцена — всё готово к вашему мероприятию."
        )}
      />

      {/* Halls grid */}
      <section id="halls" className="section section--light" style={{ borderTop: 0 }}>
        <div className="dg-wrap">
          <div className="halls-grid">
            {halls.map((h) => {
              const name = getLocalizedField(h as unknown as Record<string, unknown>, "name", locale);
              const desc = getLocalizedField(h as unknown as Record<string, unknown>, "description", locale);
              const cover =
                h.photos?.[0]?.url ||
                (h.slug === "grand"
                  ? "/photos/dvorets-08.webp"
                  : h.slug === "chamber"
                  ? "/photos/dvorets-10.webp"
                  : "/photos/dvorets-12.webp");
              const alt = h.photos?.[0]
                ? (locale === "kk" ? h.photos[0].alt_kk : h.photos[0].alt_ru) || name
                : name;
              return (
                <Link key={h.id} href={`/${locale}/rent/${h.slug}`} className="hall">
                  <div className="hall-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover} alt={alt} />
                  </div>
                  <div className="hall-body">
                    <h3 className="hall-title">{name}</h3>
                    <div className="hall-seats">
                      <DgIcon name="users" size={14} />
                      {h.capacity} {T("орын", "мест")}
                    </div>
                    <p className="hall-desc">{desc}</p>
                    <div className="hall-foot">
                      <span style={{ fontSize: 13, color: "var(--dg-text-2)" }}>
                        {T("Тегін", "Бесплатно")}
                      </span>
                      <span className="section-link" style={{ fontSize: 13 }}>
                        {T("Толығырақ", "Подробнее")}
                        <DgIcon name="arrow" size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>


      {/* CTA: бронь через AI-помощника или по телефону */}
      <section id="request" className="section">
        <div className="dg-wrap">
          <div className="section-bar" style={{ marginBottom: 28 }}>
            <div className="tag">{T("— Брондау —", "— Бронирование —")}</div>
            <h2 className="h2" dangerouslySetInnerHTML={{ __html: T("Зал <strong>брондау</strong>", "Забронировать <strong>зал</strong>") }} />
          </div>
          <p style={{ color: "var(--dg-text-2)", maxWidth: 620, marginBottom: 28 }}>
            {T(
              "Брондау AI-көмекші арқылы: ол залды, күні мен уақытты таңдауға көмектеседі және өтінім қалдырады. Әкімшілік қолжетімділікті растайды.",
              "Бронирование через AI-помощника: он поможет выбрать зал, дату и время и оформит заявку. Доступность подтверждает администратор."
            )}
          </p>
          <RentBookingChat locale={locale === "kk" ? "kk" : "ru"} />
          <a href="tel:+77106362330" className="section-link" style={{ display: "inline-flex", marginTop: 22 }}>
            {T("Немесе қоңырау шалыңыз", "Или позвоните")}: +7 (71063) 6-23-30
          </a>
        </div>
      </section>
    </div>
  );
}
