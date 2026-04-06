import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
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

export default function ClubCard({ club, locale }: ClubCardProps) {
  const name = getLocalizedField(club, "name", locale);
  const description = getLocalizedField(club, "description", locale);

  const directionLabels: Record<string, Record<string, string>> = {
    vocal: { kk: "Вокал", ru: "Вокал" },
    dance: { kk: "Би", ru: "Танцы" },
    art: { kk: "Сурет", ru: "Рисование" },
    theater: { kk: "Театр", ru: "Театр" },
    music: { kk: "Музыка", ru: "Музыка" },
    craft: { kk: "Қолөнер", ru: "Рукоделие" },
    sport: { kk: "Спорт", ru: "Спорт" },
    general: { kk: "Жалпы", ru: "Общий" },
  };

  return (
    <Card hoverable>
      <Link href={`/${locale}/clubs/${club.id}`}>
        <div className="aspect-video bg-gray-200 relative overflow-hidden">
          {club.image_url ? (
            <img
              src={club.image_url}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <svg className="w-12 h-12 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="primary">
              {directionLabels[club.direction]?.[locale] || club.direction}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{club.instructor_name}</span>
            <Badge variant="info">{club.age_group}</Badge>
          </div>
        </div>
      </Link>
    </Card>
  );
}
