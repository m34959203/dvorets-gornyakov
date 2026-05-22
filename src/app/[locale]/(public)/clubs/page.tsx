import { isValidLocale, type Locale, getLocalizedField, getMessages } from "@/lib/i18n";
import { getMany } from "@/lib/db";
import DgPageHero from "@/components/layout/DgPageHero";
import DgClubsCatalog, { type DgClub } from "@/components/features/DgClubsCatalog";
import RecommendQuiz from "@/components/features/RecommendQuiz";

export const dynamic = "force-dynamic";

type ClubRow = {
  id: string;
  name_kk: string;
  name_ru: string;
  description_kk: string;
  description_ru: string;
  image_url: string | null;
  age_group: string;
  direction: string;
  instructor_name: string;
};

const demoClubs: ClubRow[] = [
  { id: "demo-1", name_kk: "Вокал студиясы", name_ru: "Вокальная студия", description_kk: "", description_ru: "", image_url: null, age_group: "7-18", direction: "vocal", instructor_name: "Айгуль Сериковна" },
  { id: "demo-2", name_kk: "Халық билері", name_ru: "Народные танцы", description_kk: "", description_ru: "", image_url: null, age_group: "5-16", direction: "dance", instructor_name: "Динара Маратовна" },
  { id: "demo-3", name_kk: "Бейнелеу өнері студиясы", name_ru: "Студия изобразительного искусства", description_kk: "", description_ru: "", image_url: null, age_group: "6-99", direction: "art", instructor_name: "Бауыржан Нурланович" },
  { id: "demo-4", name_kk: "Театр студиясы", name_ru: "Театральная студия", description_kk: "", description_ru: "", image_url: null, age_group: "8-18", direction: "theater", instructor_name: "Сауле Бекеновна" },
  { id: "demo-5", name_kk: "Қобыз ансамблі", name_ru: "Ансамбль кобызистов", description_kk: "", description_ru: "", image_url: null, age_group: "8-18", direction: "music", instructor_name: "Р. Қасымов" },
  { id: "demo-6", name_kk: "Шахмат үйірмесі", name_ru: "Шахматный клуб", description_kk: "", description_ru: "", image_url: null, age_group: "6-18", direction: "sport", instructor_name: "" },
];

async function loadClubs(): Promise<ClubRow[]> {
  try {
    const rows = await getMany<ClubRow>(
      `SELECT id, name_kk, name_ru,
              COALESCE(description_kk,'') AS description_kk,
              COALESCE(description_ru,'') AS description_ru,
              image_url, age_group, direction,
              COALESCE(instructor_name,'') AS instructor_name
         FROM clubs
        WHERE is_active = TRUE
        ORDER BY name_ru ASC
        LIMIT 80`
    );
    return rows.length ? rows : demoClubs;
  } catch {
    return demoClubs;
  }
}

/** Парсит age_group ("7-18", "18+", "6-99") в числовой диапазон. */
function parseAge(s: string): { min: number; max: number } {
  const nums = (s.match(/\d+/g) ?? []).map(Number);
  if (s.includes("+") && nums.length) return { min: nums[0], max: 99 };
  if (nums.length >= 2) return { min: nums[0], max: nums[1] };
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return { min: 0, max: 99 };
}

export default async function ClubsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);
  const messages = getMessages(locale);

  const clubs = await loadClubs();
  const items: DgClub[] = clubs.map((c) => {
    const { min, max } = parseAge(c.age_group);
    return {
      id: c.id,
      href: `/${locale}/clubs/${c.id}`,
      name: getLocalizedField(c as unknown as Record<string, unknown>, "name", locale),
      direction: c.direction,
      ageGroup: c.age_group,
      ageMin: min,
      ageMax: max,
      teacher: c.instructor_name,
      description: getLocalizedField(c as unknown as Record<string, unknown>, "description", locale),
    };
  });

  return (
    <div className="dg-home">
      <a href="#grid" className="dg-skip-link">{T("Тізімге өту", "Перейти к списку")}</a>
      <DgPageHero
        crumbs={[
          { label: T("Басты бет", "Главная"), href: `/${locale}` },
          { label: T("Үйірмелер мен студиялар", "Кружки и студии") },
        ]}
        tag={T("— Үйірмелер мен студиялар —", "— Кружки и студии —")}
        h2Html={T("Сарайдың барлық <strong>бағыттары</strong>", "Все <strong>направления</strong> Дворца")}
        lead={T(
          "3 жастан бастап балаларға және ересектерге арналған тегін үйірмелер. Қызығушылығыңыз бен жасыңызға қарай бағыт таңдаңыз — 2026/2027 оқу жылына жазылу ашық.",
          "Бесплатные кружки для детей от 3 лет и взрослых. Выберите направление по интересам и возрасту — запись открыта на 2026/2027 учебный год."
        )}
      />

      <section className="section" style={{ borderTop: 0, paddingBottom: 0 }}>
        <div className="dg-wrap">
          <RecommendQuiz locale={locale} messages={messages.clubs} />
        </div>
      </section>

      <DgClubsCatalog locale={locale} items={items} />
    </div>
  );
}
