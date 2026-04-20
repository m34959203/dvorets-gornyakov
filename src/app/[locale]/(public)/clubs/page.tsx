import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";
import { getMany } from "@/lib/db";
import ClubCard from "@/components/features/ClubCard";
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

const directions: { value: string; label_kk: string; label_ru: string }[] = [
  { value: "all", label_kk: "Барлық бағыттар", label_ru: "Все направления" },
  { value: "vocal", label_kk: "Вокал", label_ru: "Вокал" },
  { value: "dance", label_kk: "Би", label_ru: "Танцы" },
  { value: "art", label_kk: "Сурет", label_ru: "Рисование" },
  { value: "theater", label_kk: "Театр", label_ru: "Театр" },
  { value: "sport", label_kk: "Спорт", label_ru: "Спорт" },
  { value: "general", label_kk: "Жалпы", label_ru: "Общее" },
];

const ageGroups: { value: string; label_kk: string; label_ru: string }[] = [
  { value: "all", label_kk: "Барлық жастар", label_ru: "Все возрасты" },
  { value: "3-6", label_kk: "3-6 жас", label_ru: "3-6 лет" },
  { value: "7-10", label_kk: "7-10 жас", label_ru: "7-10 лет" },
  { value: "11-14", label_kk: "11-14 жас", label_ru: "11-14 лет" },
  { value: "15-18", label_kk: "15-18 жас", label_ru: "15-18 лет" },
  { value: "18+", label_kk: "18+ жас", label_ru: "18+ лет" },
];

const demoClubs: ClubRow[] = [
  {
    id: "demo-1",
    name_kk: "Вокал студиясы",
    name_ru: "Вокальная студия",
    description_kk: "Кәсіби вокал сабақтары балалар мен ересектерге",
    description_ru: "Профессиональные занятия вокалом для детей и взрослых",
    image_url: null,
    age_group: "7-18",
    direction: "vocal",
    instructor_name: "Айгуль Сериковна",
  },
  {
    id: "demo-2",
    name_kk: "Халық билері",
    name_ru: "Народные танцы",
    description_kk: "Қазақтың ұлттық билерін үйрену",
    description_ru: "Изучение казахских национальных танцев",
    image_url: null,
    age_group: "5-16",
    direction: "dance",
    instructor_name: "Динара Маратовна",
  },
  {
    id: "demo-3",
    name_kk: "Бейнелеу өнері студиясы",
    name_ru: "Студия изобразительного искусства",
    description_kk: "Сурет салу, кескіндеме, графика",
    description_ru: "Рисунок, живопись, графика",
    image_url: null,
    age_group: "6-99",
    direction: "art",
    instructor_name: "Бауыржан Нурланович",
  },
  {
    id: "demo-4",
    name_kk: "Театр студиясы",
    name_ru: "Театральная студия",
    description_kk: "Актёрлік шеберлік, сценалық сөйлеу",
    description_ru: "Актёрское мастерство, сценическая речь",
    image_url: null,
    age_group: "8-18",
    direction: "theater",
    instructor_name: "Сауле Бекеновна",
  },
];

async function loadClubs(filters: {
  direction?: string;
  age?: string;
}): Promise<{ items: ClubRow[]; isDemo: boolean }> {
  try {
    const conditions: string[] = ["is_active = TRUE"];
    const params: unknown[] = [];

    if (filters.direction && filters.direction !== "all") {
      params.push(filters.direction);
      conditions.push(`direction = $${params.length}`);
    }
    if (filters.age && filters.age !== "all") {
      params.push(filters.age);
      conditions.push(`age_group = $${params.length}`);
    }

    const rows = await getMany<ClubRow>(
      `SELECT id, name_kk, name_ru, description_kk, description_ru,
              image_url, age_group, direction, instructor_name
         FROM clubs
        WHERE ${conditions.join(" AND ")}
        ORDER BY name_ru ASC
        LIMIT 60`,
      params
    );
    if (!rows.length) {
      return { items: demoClubs, isDemo: true };
    }
    return { items: rows, isDemo: false };
  } catch {
    return { items: demoClubs, isDemo: true };
  }
}

function pickParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ClubsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam } = await params;
  const sp = await searchParams;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);
  const t = messages.clubs;

  const directionFilter = pickParam(sp.direction) || "all";
  const ageFilter = pickParam(sp.age) || "all";

  const { items } = await loadClubs({
    direction: directionFilter,
    age: ageFilter,
  });

  const buildHref = (
    override: Partial<{ direction: string; age: string }>
  ): string => {
    const nextDirection =
      override.direction !== undefined ? override.direction : directionFilter;
    const nextAge = override.age !== undefined ? override.age : ageFilter;
    const qs = new URLSearchParams();
    if (nextDirection && nextDirection !== "all") {
      qs.set("direction", nextDirection);
    }
    if (nextAge && nextAge !== "all") {
      qs.set("age", nextAge);
    }
    const query = qs.toString();
    return `/${locale}/clubs${query ? `?${query}` : ""}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

      {/* AI Recommendation Quiz */}
      <div className="mb-8">
        <RecommendQuiz locale={locale} messages={t} />
      </div>

      {/* Direction filter */}
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          {t.direction}
        </div>
        <div className="flex flex-wrap gap-2">
          {directions.map((dir) => {
            const active = directionFilter === dir.value;
            return (
              <a
                key={dir.value}
                href={buildHref({ direction: dir.value })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-primary"
                }`}
              >
                {locale === "kk" ? dir.label_kk : dir.label_ru}
              </a>
            );
          })}
        </div>
      </div>

      {/* Age filter */}
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          {t.ageGroup}
        </div>
        <div className="flex flex-wrap gap-2">
          {ageGroups.map((ag) => {
            const active = ageFilter === ag.value;
            return (
              <a
                key={ag.value}
                href={buildHref({ age: ag.value })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-primary"
                }`}
              >
                {locale === "kk" ? ag.label_kk : ag.label_ru}
              </a>
            );
          })}
        </div>
      </div>

      {/* Clubs Grid */}
      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-12">{t.noClubs}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((club) => (
            <ClubCard key={club.id} club={club} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
