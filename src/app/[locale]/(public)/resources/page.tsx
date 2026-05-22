import { isValidLocale, type Locale } from "@/lib/i18n";
import DgPageHero from "@/components/layout/DgPageHero";
import DgIcon from "@/components/layout/DgIcon";

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const resources =
    locale === "kk"
      ? [
          { title: "Мәдениет министрлігі", url: "https://www.gov.kz/memleket/entities/mcs", description: "ҚР Мәдениет және спорт министрлігі" },
          { title: "Ұлттық кітапхана", url: "https://nlrk.kz", description: "Қазақстан Республикасының Ұлттық кітапханасы" },
          { title: "Білім порталы", url: "https://bilimland.kz", description: "Балаларға арналған білім беру порталы" },
          { title: "E-gov", url: "https://egov.kz", description: "Электронды үкімет порталы" },
        ]
      : [
          { title: "Министерство культуры", url: "https://www.gov.kz/memleket/entities/mcs", description: "Министерство культуры и спорта РК" },
          { title: "Национальная библиотека", url: "https://nlrk.kz", description: "Национальная библиотека Республики Казахстан" },
          { title: "Образовательный портал", url: "https://bilimland.kz", description: "Образовательный портал для детей" },
          { title: "E-gov", url: "https://egov.kz", description: "Портал электронного правительства" },
        ];

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
      <section className="section" style={{ borderTop: 0 }}>
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
