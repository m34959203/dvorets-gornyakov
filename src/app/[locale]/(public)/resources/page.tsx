import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);

  const resources = locale === "kk" ? [
    { title: "Мәдениет министрлігі", url: "https://www.gov.kz/memleket/entities/mcs", description: "ҚР Мәдениет және спорт министрлігі" },
    { title: "Ұлттық кітапхана", url: "https://nlrk.kz", description: "Қазақстан Республикасының Ұлттық кітапханасы" },
    { title: "Білім порталы", url: "https://bilimland.kz", description: "Балаларға арналған білім беру порталы" },
    { title: "E-gov", url: "https://egov.kz", description: "Электронды үкімет порталы" },
  ] : [
    { title: "Министерство культуры", url: "https://www.gov.kz/memleket/entities/mcs", description: "Министерство культуры и спорта РК" },
    { title: "Национальная библиотека", url: "https://nlrk.kz", description: "Национальная библиотека Республики Казахстан" },
    { title: "Образовательный портал", url: "https://bilimland.kz", description: "Образовательный портал для детей" },
    { title: "E-gov", url: "https://egov.kz", description: "Портал электронного правительства" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{messages.common.resources}</h1>
      <div className="space-y-4">
        {resources.map((resource, i) => (
          <a
            key={i}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary mb-1">{resource.title}</h3>
                <p className="text-sm text-gray-600">{resource.description}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
