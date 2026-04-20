import Link from "next/link";
import type { Locale } from "@/lib/i18n";

interface Hall {
  id: string;
  slug?: string;
  name: string;
  seats: number;
  description: string;
  features: string[];
  price: string;
  image: string;
}

interface HallCardProps {
  hall: Hall;
  locale: Locale;
}

export default function HallCard({ hall, locale }: HallCardProps) {
  return (
    <article className="hall-card">
      <div className="hall-media">
        <img src={hall.image} alt={hall.name} loading="lazy" />
      </div>
      <div className="hall-body">
        <h3 className="hall-title">{hall.name}</h3>
        <div className="hall-seats">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 19V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12" />
            <path d="M3 19h18" />
            <path d="M8 19v-4h8v4" />
          </svg>
          {hall.seats} {locale === "kk" ? "орын" : "мест"}
        </div>
        <p className="hall-desc">{hall.description}</p>
        <ul className="hall-feat">
          {hall.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <div className="hall-foot">
          <div className="hall-price">{hall.price}</div>
          <Link
            href={hall.slug ? `/${locale}/rent/${hall.slug}` : `/${locale}/rent`}
            className="btn btn-ghost btn-sm"
          >
            {locale === "kk" ? "Брондау" : "Забронировать"}
          </Link>
        </div>
      </div>
    </article>
  );
}
