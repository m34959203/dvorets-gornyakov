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
    <section
      className="relative isolate overflow-hidden bg-primary-dark text-white"
      aria-label={title}
    >
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(9,84,86,0.92) 0%, rgba(13,115,119,0.75) 50%, rgba(26,26,46,0.9) 100%), url(/hero/hero.jpg)",
        }}
      />
      <div className="absolute inset-0 -z-10 opacity-20 mix-blend-overlay">
        <svg className="h-full w-full" viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden="true">
          <pattern id="hero-ornament" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M24 0L48 24L24 48L0 24Z" fill="white" />
            <circle cx="24" cy="24" r="6" fill="none" stroke="white" strokeWidth="1.2" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hero-ornament)" />
        </svg>
      </div>

      <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:min-h-[86vh] lg:px-8">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-white/90 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {badge}
        </span>

        <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
          {headline}
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-white/85 sm:text-xl">
          {lead}
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href={`/${locale}/events`}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-primary-dark shadow-lg shadow-accent/20 transition hover:bg-accent-light"
          >
            {ctaSchedule}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href={`/${locale}/rent`}
            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            {ctaRent}
          </Link>
        </div>

        <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-bounce text-white/60 sm:block">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[color:var(--background)]" />
    </section>
  );
}
