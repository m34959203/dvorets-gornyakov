import Link from "next/link";
import type { Hall } from "@/lib/rent/types";
import type { Locale } from "@/lib/i18n";
import { getLocalizedField } from "@/lib/i18n";
import DgIcon from "@/components/layout/DgIcon";

interface Props {
  hall: Hall;
  locale: Locale;
  labels: {
    capacity: string;
    from: string;
    currency: string;
    details: string;
  };
}

export default function HallCard({ hall, locale, labels }: Props) {
  const name = getLocalizedField(hall as unknown as Record<string, unknown>, "name", locale);
  const desc = getLocalizedField(hall as unknown as Record<string, unknown>, "description", locale);
  const cover =
    hall.photos?.[0]?.url ||
    (hall.slug === "grand"
      ? "/photos/dvorets-07.webp"
      : hall.slug === "chamber"
      ? "/photos/dvorets-12.webp"
      : "/photos/dvorets-11.webp");
  const alt = hall.photos?.[0]
    ? locale === "kk"
      ? hall.photos[0].alt_kk || name
      : hall.photos[0].alt_ru || name
    : name;

  return (
    <Link href={`/${locale}/rent/${hall.slug}`} className="hall">
      <div className="hall-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt={alt} />
      </div>
      <div className="hall-body">
        <h3 className="hall-title">{name}</h3>
        <div className="hall-seats">
          <DgIcon name="users" size={14} />
          {hall.capacity} {locale === "kk" ? "орын" : "мест"}
        </div>
        <p className="hall-desc">{desc}</p>
        <div className="hall-foot">
          <span style={{ fontSize: 13, color: "var(--dg-text-2)" }}>
            {locale === "kk" ? "Тегін" : "Бесплатно"}
          </span>
          <span className="section-link" style={{ fontSize: 13 }}>
            {labels.details}
            <DgIcon name="arrow" size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
