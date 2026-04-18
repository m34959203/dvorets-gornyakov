import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, type Locale, getMessages, getLocalizedField } from "@/lib/i18n";
import { getOne } from "@/lib/db";
import Badge from "@/components/ui/Badge";
import EnrollmentForm from "@/components/features/EnrollmentForm";

const SITE_NAME_KK = "Ш. Ділдебаев атындағы тау-кенші сарайы";
const SITE_NAME_RU = "Дворец горняков им. Ш. Дільдебаева";

function getBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  const fallback = env || "https://dvorets-gornyakov.kz";
  return fallback.replace(/\/$/, "");
}

type ClubMetaRow = {
  id: string;
  name_kk: string;
  name_ru: string;
  description_kk: string | null;
  description_ru: string | null;
  image_url: string | null;
};

async function loadClubMeta(id: string): Promise<ClubMetaRow | null> {
  try {
    return await getOne<ClubMetaRow>(
      `SELECT id, name_kk, name_ru, description_kk, description_ru, image_url
         FROM clubs WHERE id = $1 AND is_active = TRUE`,
      [id]
    );
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: lp, id } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const row = await loadClubMeta(id);

  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/${locale}/clubs/${id}`;
  const languages = {
    kk: `${baseUrl}/kk/clubs/${id}`,
    ru: `${baseUrl}/ru/clubs/${id}`,
  };

  if (!row) {
    return { title: "Not found" };
  }

  const name = getLocalizedField(row, "name", locale);
  const description = getLocalizedField(row, "description", locale);
  const images = row.image_url ? [row.image_url] : [];
  return {
    title: `${name} — ${locale === "kk" ? SITE_NAME_KK : SITE_NAME_RU}`,
    description,
    openGraph: {
      title: name,
      description,
      type: "article",
      images,
    },
    alternates: {
      canonical,
      languages,
    },
  };
}

const demoClubs: Record<string, {
  id: string; name_kk: string; name_ru: string;
  description_kk: string; description_ru: string;
  image_url: null; age_group: string; direction: string;
  instructor_name: string; schedule: { day: string; time: string }[];
}> = {
  "1": {
    id: "1", name_kk: "Вокал студиясы", name_ru: "Вокальная студия",
    description_kk: "Кәсіби вокал сабақтары балалар мен ересектерге. Дауыс қою, репертуар таңдау, сахнада өнер көрсету дағдылары.",
    description_ru: "Профессиональные занятия вокалом для детей и взрослых. Постановка голоса, подбор репертуара, навыки сценического выступления.",
    image_url: null, age_group: "7-18", direction: "vocal", instructor_name: "Айгуль Сериковна",
    schedule: [{ day: "Пн", time: "15:00-16:30" }, { day: "Ср", time: "15:00-16:30" }, { day: "Пт", time: "15:00-16:30" }],
  },
};

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);
  const t = messages.clubs;

  const club = demoClubs[id] || demoClubs["1"];
  const name = getLocalizedField(club, "name", locale);
  const description = getLocalizedField(club, "description", locale);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/${locale}/clubs`} className="inline-flex items-center text-primary hover:text-primary-dark mb-6">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {messages.common.back}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Club Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <svg className="w-20 h-20 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                <Badge variant="primary">{club.direction}</Badge>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">{description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">{t.instructor}</div>
                    <div className="font-medium text-gray-900">{club.instructor_name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">{t.ageGroup}</div>
                    <div className="font-medium text-gray-900">{club.age_group} {locale === "kk" ? "жас" : "лет"}</div>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">{t.schedule}</h3>
                <div className="flex flex-wrap gap-2">
                  {club.schedule.map((s, i) => (
                    <div key={i} className="px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                      <span className="font-medium text-primary">{s.day}</span>{" "}
                      <span className="text-gray-600">{s.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment Form */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t.enroll}</h2>
            <EnrollmentForm clubId={club.id} locale={locale} messages={t} />
          </div>
        </div>
      </div>
    </div>
  );
}
