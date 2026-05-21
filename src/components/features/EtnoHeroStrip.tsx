import type { ReactNode } from "react";

interface EtnoHeroStripProps {
  kicker: string;
  title: ReactNode;
  description?: string;
  minHeight?: number;
}

/**
 * Hero-полоса для внутренних страниц (Аренда / Кружки / События / Новости / О нас):
 * слева — вертикальный орнамент на тёмном изумруде, справа — kicker + h1 + lead.
 */
export default function EtnoHeroStrip({
  kicker,
  title,
  description,
  minHeight,
}: EtnoHeroStripProps) {
  return (
    <section className="etno-hero-strip" style={minHeight ? { minHeight } : undefined}>
      <div className="vert-ornament" />
      <div className="etno-hero-strip-body">
        <span className="eyebrow">{kicker}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </section>
  );
}
