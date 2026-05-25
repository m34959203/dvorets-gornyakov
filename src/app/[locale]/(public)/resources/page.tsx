import { isValidLocale, type Locale } from "@/lib/i18n";
import DgPageHero from "@/components/layout/DgPageHero";
import DgIcon from "@/components/layout/DgIcon";
import { RESOURCE_LINKS, resourceTitle, resourceDesc } from "@/lib/resources";

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const resources = RESOURCE_LINKS.map((r) => ({
    title: resourceTitle(r, locale),
    url: r.url,
    description: resourceDesc(r, locale),
  }));

  return (
    <div className="dg-home">
      <DgPageHero
        crumbs={[
          { label: T("Басты бет", "Главная"), href: `/${locale}` },
          { label: T("Ресурстар", "Ресурсы") },
        ]}
        tag={T("— Пайдалы сілтемелер —", "— Полезные ссылки —")}
        h2Html={T("Ресурстар мен <strong>сілтемелер</strong>", "Ресурсы и <strong>ссылки</strong>")}
        lead={T(
          "Серіктес мекемелер мен мемлекеттік порталдарға пайдалы сілтемелер.",
          "Полезные ссылки на партнёрские учреждения и государственные порталы."
        )}
      />
      <section className="section section--light" style={{ borderTop: 0 }}>
        <div className="dg-wrap">
          <ul className="link-list">
            {resources.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  <span>
                    <span className="t">{r.title}</span>
                    <span style={{ display: "block", marginTop: 4, fontSize: 13, color: "var(--dg-text-2)" }}>
                      {r.description}
                    </span>
                  </span>
                  <DgIcon name="arrow" size={16} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
