import Link from "next/link";
import type { Locale } from "@/lib/i18n";

interface HomeHeroProps {
  locale: Locale;
  title: string;
  headline: string;
  lead: string;
  badge: string;
  ctaSchedule: string;
  ctaRent: string;
}

export default function HomeHero({
  locale,
  title,
  headline,
  lead,
  badge,
  ctaSchedule,
  ctaRent,
}: HomeHeroProps) {
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

        </div>
      </div>

      {/* Ornament line at the bottom */}
      <div className="ornament on-dark absolute bottom-0 left-0 right-0 z-[2] opacity-[0.35]" />
    </section>
  );
}
