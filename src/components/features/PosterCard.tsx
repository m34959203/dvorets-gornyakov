import Link from "next/link";

export interface Poster {
  title: string;
  date: string;
  time: string;
  hall: string;
  price: string;
  href?: string;
  free?: boolean;
}

interface PosterCardProps {
  p: Poster;
  idx: number;
  detailsLabel?: string;
}

const PALETTES = [
  "linear-gradient(160deg, #0d7377 0%, #074143 100%)",
  "linear-gradient(160deg, #d4a843 0%, #8c6c1f 100%)",
  "linear-gradient(160deg, #095456 0%, #0d7377 60%, #d4a843 200%)",
  "linear-gradient(160deg, #b8862a 0%, #5a3f0e 100%)",
];

const ICONS = {
  cal: (
    <path
      d="M3 5h10v8H3zM3 5V3M13 5V3M3 8h10"
      stroke="currentColor"
      strokeWidth="1.3"
      fill="none"
    />
  ),
  pin: (
    <path
      d="M8 1c3 0 5 2.5 5 5 0 3-5 9-5 9s-5-6-5-9c0-2.5 2-5 5-5zM8 7.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
      stroke="currentColor"
      strokeWidth="1.3"
      fill="none"
    />
  ),
  ticket: (
    <path
      d="M2 5a1 1 0 011-1h10a1 1 0 011 1v2a1.5 1.5 0 000 3v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2a1.5 1.5 0 000-3V5z"
      stroke="currentColor"
      strokeWidth="1.3"
      fill="none"
    />
  ),
};

function Row({
  icon,
  text,
  accent,
}: {
  icon: keyof typeof ICONS;
  text: string;
  accent?: boolean;
}) {
  return (
    <div className={accent ? "poster-row accent" : "poster-row"}>
      <svg width="14" height="14" viewBox="0 0 16 16">
        {ICONS[icon]}
      </svg>
      {text}
    </div>
  );
}

export default function PosterCard({ p, idx, detailsLabel = "Подробнее" }: PosterCardProps) {
  const bg = PALETTES[idx % PALETTES.length];
  const isFree = p.free ?? /^(Тегін|Бесплатно|Free)$/i.test(p.price);
  const href = p.href ?? "#";
  return (
    <article className="poster-card">
      <div className="poster-cover" style={{ background: bg }}>
        <div className="poster-cover-inner">
          <div className="poster-cover-kicker">Афиша</div>
          <div className="poster-cover-title">{p.title}</div>
        </div>
      </div>
      <div className="poster-body">
        <h3>{p.title}</h3>
        <Row icon="cal" text={`${p.date} · ${p.time}`} />
        <Row icon="pin" text={p.hall} />
        <Row icon="ticket" text={p.price} accent={isFree} />
        <Link href={href} className="poster-link">
          {detailsLabel}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 6h6m0 0L6 3m3 3l-3 3" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
