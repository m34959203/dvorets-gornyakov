import Link from "next/link";
import type { Locale } from "@/lib/i18n";

interface ChecklistMessages {
  sectionBadge: string;
  title: string;
  lead: string;
  item1Title: string;
  item1Desc: string;
  item2Title: string;
  item2Desc: string;
  item3Title: string;
  item3Desc: string;
  item4Title: string;
  item4Desc: string;
  item5Title: string;
  item5Desc: string;
  item6Title: string;
  item6Desc: string;
  ctaTitle: string;
  ctaLead: string;
  ctaButton: string;
  ctaSecondary: string;
}

interface RentalChecklistProps {
  locale: Locale;
  messages: ChecklistMessages;
}

export default function RentalChecklist({ locale, messages: m }: RentalChecklistProps) {
  const items = [
    { title: m.item1Title, desc: m.item1Desc },
    { title: m.item2Title, desc: m.item2Desc },
    { title: m.item3Title, desc: m.item3Desc },
    { title: m.item4Title, desc: m.item4Desc },
    { title: m.item5Title, desc: m.item5Desc },
    { title: m.item6Title, desc: m.item6Desc },
  ];

  return (
    <section className="relative bg-[color:var(--background)] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {m.sectionBadge}
          </span>
          <h2 className="mt-5 text-balance text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            {m.title}
          </h2>
          <p className="mt-4 text-lg text-gray-600">{m.lead}</p>
        </div>

        <ol className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="group flex gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-accent-dark">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-8 text-white shadow-xl sm:p-12">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold sm:text-3xl">{m.ctaTitle}</h3>
              <p className="mt-2 text-white/85">{m.ctaLead}</p>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link
                href={`/${locale}/contacts`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-primary-dark shadow-lg shadow-black/10 transition hover:bg-accent-light"
              >
                {m.ctaButton}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a
                href={`tel:${m.ctaSecondary.replace(/[^+\d]/g, "")}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.515l.58 2.32a2 2 0 01-.45 1.843L8.09 10.09a11 11 0 005.82 5.82l1.41-1.27a2 2 0 011.84-.45l2.32.58A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C9.61 21 3 14.39 3 6V5z" />
                </svg>
                {m.ctaSecondary}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
