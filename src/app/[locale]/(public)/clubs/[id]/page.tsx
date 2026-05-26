import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, type Locale, getLocalizedField } from "@/lib/i18n";
import { getOne } from "@/lib/db";
import { clubImage } from "@/lib/event-image";
import DgPageHero from "@/components/layout/DgPageHero";
import DgIcon from "@/components/layout/DgIcon";
import EnrollmentForm from "@/components/features/EnrollmentForm";

export const dynamic = "force-dynamic";

const SITE_NAME_KK = "Ш. Ділдебаев атындағы тау-кенші сарайы";
const SITE_NAME_RU = "Дворец горняков им. Ш. Дильдебаева";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  const fallback = env || "https://dvorets-gornyakov.kz";
  return fallback.replace(/\/$/, "");
}

type ScheduleItem = { day: string; time: string };

type ClubMetaRow = {
  id: string;
  name_kk: string;
  name_ru: string;
  description_kk: string | null;
  description_ru: string | null;
  image_url: string | null;
};

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
  schedule: unknown;
};

function parseSchedule(raw: unknown): ScheduleItem[] {
  if (!Array.isArray(raw)) return [];
  const out: ScheduleItem[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      "day" in item &&
      "time" in item &&
      typeof (item as { day: unknown }).day === "string" &&
      typeof (item as { time: unknown }).time === "string"
    ) {
      out.push({
        day: (item as { day: string }).day,
        time: (item as { time: string }).time,
      });
    }
  }
  return out;
}

async function loadClubMeta(id: string): Promise<ClubMetaRow | null> {
  if (!UUID_RE.test(id)) return null;
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

async function loadClub(id: string): Promise<ClubRow | null> {
  if (!UUID_RE.test(id)) return null;
  try {
    return await getOne<ClubRow>(
      `SELECT id, name_kk, name_ru, description_kk, description_ru,
              image_url, age_group, direction, instructor_name, schedule
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

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";

  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  if (!UUID_RE.test(id)) notFound();

  const club = await loadClub(id);
  if (!club) notFound();

  const name = getLocalizedField(club as unknown as Record<string, unknown>, "name", locale);
  const description = getLocalizedField(club as unknown as Record<string, unknown>, "description", locale);
  const schedule: ScheduleItem[] = parseSchedule(club.schedule);
  const cover = clubImage(club.image_url, club.direction);

  const directionLabel = T(
    club.direction || "Жалпы",
    club.direction || "Общее"
  );
  const ageLabel = `${club.age_group} ${T("жас", "лет")}`;
  const tagLabel = `${directionLabel} · ${ageLabel}`;

  // Messages needed for form
  const formMessages: Record<string, string> = {
    childName: T("Баланың аты-жөні", "Имя ребёнка"),
    childAge: T("Баланың жасы", "Возраст ребёнка"),
    parentName: T("Ата-ана / өкілдің аты-жөні", "Имя родителя / представителя"),
    phone: T("Телефон", "Телефон"),
    enroll: T("Жазылу", "Записаться"),
    enrollError: T("Қате орын алды. Қайталаңыз.", "Произошла ошибка. Попробуйте ещё раз."),
    enrollSuccess: T(
      "Өтініміңіз қабылданды! Тезірек хабарласамыз.",
      "Заявка принята! Мы свяжемся с вами в ближайшее время."
    ),
  };

  return (
    <div className="dg-home">
      <DgPageHero
        crumbs={[
          { label: T("Басты бет", "Главная"), href: `/${locale}` },
          { label: T("Үйірмелер", "Кружки"), href: `/${locale}/clubs` },
          { label: name },
        ]}
        tag={tagLabel}
        h2Html={name}
      />

      <section className="section" style={{ borderTop: 0 }}>
        <div className="dg-wrap">
          <div className="detail-grid">
            {/* ── MAIN ── */}
            <div>
              <div className="detail-cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt={name} />
              </div>

              <ul className="feature-meta" style={{ marginTop: 28 }}>
                <li>
                  <span className="lab">
                    <DgIcon name="stars" size={14} />
                    {T("Бағыт", "Направление")}
                  </span>
                  <span className="val">{club.direction}</span>
                </li>
                <li>
                  <span className="lab">
                    <DgIcon name="users" size={14} />
                    {T("Жас тобы", "Возраст")}
                  </span>
                  <span className="val">{ageLabel}</span>
                </li>
                <li>
                  <span className="lab">
                    <DgIcon name="user" size={14} />
                    {T("Педагог", "Педагог")}
                  </span>
                  <span className="val">{club.instructor_name || "—"}</span>
                </li>

                {schedule.length > 0 && (
                  <li>
                    <span className="lab">
                      <DgIcon name="calendar" size={14} />
                      {T("Кесте", "Расписание")}
                    </span>
                    <span className="val">
                      {schedule.map(({ day, time }, i) => (
                        <span key={`${day}-${time}-${i}`} style={{ display: "block" }}>
                          {day}
                          {time ? ` — ${time}` : ""}
                        </span>
                      ))}
                    </span>
                  </li>
                )}

                <li>
                  <span className="lab">
                    <DgIcon name="coin" size={14} />
                    {T("Құны", "Стоимость")}
                  </span>
                  <span className="val price">{T("Тегін", "Бесплатно")}</span>
                </li>
              </ul>

              {description && (
                <div className="dg-prose" style={{ marginTop: 28 }}>
                  <p style={{ whiteSpace: "pre-wrap" }}>{description}</p>
                </div>
              )}
            </div>

            {/* ── ASIDE ── */}
            <aside className="detail-aside">
              <h3>{T("Үйірмеге жазылу", "Записаться в кружок")}</h3>
              <EnrollmentForm clubId={club.id} locale={locale} messages={formMessages} />
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
