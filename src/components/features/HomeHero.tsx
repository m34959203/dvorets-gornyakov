import Link from "next/link";
import type { Locale } from "@/lib/i18n";

interface HeroEvent {
  id: string;
  title: string;
  day: string;
  month: string;
  time: string;
  hall: string;
  price: string;
}

interface HomeHeroProps {
  locale: Locale;
  title: string;
  headline: string;
  lead: string;
  badge: string;
  ctaSchedule: string;
  ctaRent: string;
  upcoming?: HeroEvent[];
}

const DEFAULT_UPCOMING_RU: HeroEvent[] = [
  { id: "1", title: "Симфонический концерт к Наурызу", day: "22", month: "МАР", time: "18:00", hall: "Главный зал", price: "от 2 500 ₸" },
  { id: "2", title: "Вечер казахской поэзии", day: "05", month: "АПР", time: "19:00", hall: "Камерный зал", price: "Вход свободный" },
  { id: "3", title: "Танцевальный мастер-класс", day: "15", month: "АПР", time: "14:00", hall: "Репетиционный", price: "от 1 000 ₸" },
];

const DEFAULT_UPCOMING_KK: HeroEvent[] = [
  { id: "1", title: "Наурызға арналған симфониялық концерт", day: "22", month: "НАУ", time: "18:00", hall: "Негізгі зал", price: "2 500 ₸-ден" },
  { id: "2", title: "Қазақ поэзиясы кеші", day: "05", month: "СӘУ", time: "19:00", hall: "Камералық зал", price: "Тегін" },
  { id: "3", title: "Би шеберханасы", day: "15", month: "СӘУ", time: "14:00", hall: "Репетиция залы", price: "1 000 ₸-ден" },
];

export default function HomeHero({
  locale,
  title,
  headline,
  lead,
  badge,
  ctaSchedule,
  ctaRent,
  upcoming,
}: HomeHeroProps) {
  const items = upcoming ?? (locale === "kk" ? DEFAULT_UPCOMING_KK : DEFAULT_UPCOMING_RU);

  return (
    <section className="hero-wrap" aria-label={title}>
      <div className="hero-media">
        {/* Unsplash fallback — заменится пользовательским /hero/hero.jpg если лежит в public */}
        <picture>
          <source srcSet="/hero/hero.jpg" />
          <img
            src="https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1600&q=80"
            alt=""
          />
        </picture>
        <div className="hero-overlay" />
      </div>

      <div className="max-w-[1240px] mx-auto px-7 w-full">
        <div className="hero-grid">
          <div className="fade-up">
            <div className="hero-eyebrow">
              <span className="dot" />
              {badge}
            </div>

            <h1 className="hero-title">
              {headline.split("|").map((part, i, arr) => (
                <span key={i}>
                  {i === arr.length - 1 ? <span className="accent">{part}</span> : part}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </h1>

            <p className="hero-lead">{lead}</p>

            <div className="hero-actions">
              <Link href={`/${locale}/events`} className="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v2a2 2 0 0 0 0 4v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-2a2 2 0 0 0 0-4Z" />
                  <path d="M13 5v14" />
                </svg>
                {ctaSchedule}
              </Link>
              <Link href={`/${locale}/rent`} className="btn btn-outline">
                {ctaRent}
              </Link>
            </div>

            <div className="hero-stats">
              <div>
                <div className="hero-stat-n">
                  60<span>+</span>
                </div>
                <div className="hero-stat-l">
                  {locale === "kk" ? "жыл тарих" : "лет истории"}
                </div>
              </div>
              <div>
                <div className="hero-stat-n">
                  20<span>+</span>
                </div>
                <div className="hero-stat-l">
                  {locale === "kk" ? "үйірмелер" : "творческих кружков"}
                </div>
              </div>
              <div>
                <div className="hero-stat-n">
                  500<span>+</span>
                </div>
                <div className="hero-stat-l">
                  {locale === "kk" ? "тәрбиеленуші" : "воспитанников"}
                </div>
              </div>
            </div>
          </div>

          {/* Widget: upcoming events */}
          <aside className="hero-widget fade-up">
            <div className="hw-head">
              <div className="eyebrow">
                {locale === "kk" ? "Жақын іс-шаралар" : "Ближайшие события"}
              </div>
              <Link href={`/${locale}/events`} className="hw-all">
                {locale === "kk" ? "Бүкіл афиша →" : "Вся афиша →"}
              </Link>
            </div>
            <div className="hw-list">
              {items.map((ev) => (
                <Link key={ev.id} href={`/${locale}/events`} className="hw-item">
                  <div className="hw-date">
                    <div className="d">{ev.day}</div>
                    <div className="m">{ev.month}</div>
                  </div>
                  <div>
                    <div className="hw-title">{ev.title}</div>
                    <div className="hw-meta">
                      {ev.time} · {ev.hall}
                    </div>
                    <div className="hw-price">{ev.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Ornament line at the bottom */}
      <div className="ornament on-dark absolute bottom-0 left-0 right-0 z-[2] opacity-[0.35]" />
    </section>
  );
}
