import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

interface DgPageHeroProps {
  crumbs: Crumb[];
  tag: string;
  /** Заголовок; допускается <strong> для акцента. */
  h2Html: string;
  lead?: string;
}

// Шапка внутренней страницы для chiaroscuro-редизайна: крошки + section-bar + лид.
export default function DgPageHero({ crumbs, tag, h2Html, lead }: DgPageHeroProps) {
  return (
    <section className="page-hero">
      <div className="dg-wrap">
        <div className="crumbs">
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              {i > 0 && <span className="sep">/</span>}
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
            </span>
          ))}
        </div>
        <div className="section-bar">
          <div className="tag">{tag}</div>
          <h1 className="h2" dangerouslySetInnerHTML={{ __html: h2Html }} />
        </div>
        {lead && <p className="page-lead">{lead}</p>}
      </div>
    </section>
  );
}
