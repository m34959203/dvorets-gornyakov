import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getLocalizedField } from "@/lib/i18n";

interface Club {
  id: string;
  name_kk: string;
  name_ru: string;
  description_kk: string;
  description_ru: string;
  image_url: string | null;
  age_group: string;
  direction: string;
  instructor_name: string;
}

interface ClubCardProps {
  club: Club;
  locale: Locale;
}

const DIRECTION_LABELS: Record<string, Record<Locale, string>> = {
  vocal: { kk: "Вокал", ru: "Вокал" },
  dance: { kk: "Би", ru: "Танцы" },
  art: { kk: "ИЗО", ru: "ИЗО" },
  theater: { kk: "Театр", ru: "Театр" },
  music: { kk: "Музыка", ru: "Музыка" },
  craft: { kk: "Қолөнер", ru: "Рукоделие" },
  sport: { kk: "Спорт", ru: "Спорт" },
  general: { kk: "Жалпы", ru: "Общее" },
};

const FALLBACK_IMG: Record<string, string> = {
  vocal: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
  dance: "https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=1200&q=80",
  art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80",
  theater: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80",
  music: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&q=80",
  craft: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80",
  sport: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1200&q=80",
  general: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
};

export default function ClubCard({ club, locale }: ClubCardProps) {
  const name = getLocalizedField(club, "name", locale);
  const description = getLocalizedField(club, "description", locale);
  const cat = DIRECTION_LABELS[club.direction]?.[locale] || club.direction;
  const img = club.image_url || FALLBACK_IMG[club.direction] || FALLBACK_IMG.general;

  return (
    <Link href={`/${locale}/clubs/${club.id}`} className="club-card no-underline">
      <div className="club-media">
        <img src={img} alt={name} loading="lazy" />
      </div>
      <div className="club-body">
        <div className="badge-soft">{cat}</div>
        <h3 className="club-title">{name}</h3>
        <p className="club-desc line-clamp-3">{description}</p>
        <div className="club-meta">
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {club.age_group}
          </span>
          {club.instructor_name && (
            <span className="club-teacher">
              {locale === "kk" ? "Ұстаз" : "Педагог"}: {club.instructor_name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
