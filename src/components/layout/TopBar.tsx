import type { Locale } from "@/lib/i18n";
import { RESOURCE_LINKS, resourceTitle } from "@/lib/resources";

// Верхняя утилитарная строка над навигацией: партнёрские учреждения и гос-порталы.
export default function TopBar({ locale }: { locale: Locale }) {
  return (
    <div className="dg-topbar">
      <div className="dg-wrap dg-topbar-inner">
        <span className="dg-topbar-label">
          {locale === "kk" ? "Пайдалы сілтемелер" : "Полезные ссылки"}
        </span>
        <nav className="dg-topbar-links" aria-label={locale === "kk" ? "Пайдалы сілтемелер" : "Полезные ссылки"}>
          {RESOURCE_LINKS.map((r) => (
            <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer">
              {resourceTitle(r, locale)}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
