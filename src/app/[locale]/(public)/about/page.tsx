import type { Metadata } from "next";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";

const SITE_NAME_KK = "Ш. Ділдебаев атындағы тау-кенші сарайы";
const SITE_NAME_RU = "Дворец горняков им. Ш. Дільдебаева";

function getBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  const fallback = env || "https://dvorets-gornyakov.kz";
  return fallback.replace(/\/$/, "");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: lp } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const title =
    locale === "kk"
      ? `Біз туралы — ${SITE_NAME_KK}`
      : `О нас — ${SITE_NAME_RU}`;
  const description =
    locale === "kk"
      ? "Ш. Ділдебаев атындағы тау-кенші сарайының тарихы, миссиясы және жетекшілігі — Сәтбаев қаласындағы мәдени орталық (1974/2000)."
      : "История, миссия и руководство Дворца горняков им. Ш. Дильдебаева — культурного центра города Сатпаев (1974/2000).";
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/${locale}/about`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [],
    },
    alternates: {
      canonical,
      languages: {
        kk: `${baseUrl}/kk/about`,
        ru: `${baseUrl}/ru/about`,
      },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);
  const t = messages.about;

  const content = locale === "kk" ? {
    history: `Ғимарат 1974 жылы Сәтбаев қаласында «Байқоңыр» кинотеатры ретінде ашылған. 2000 жылы күрделі жөндеуден кейін мекеме «Ш. Ділдебаев атындағы тау-кенші сарайы» болып қайта аталды; 2001 жылы оның құрамында ақын Шынболат Ділдебаевтың музейі ашылды.

2019 жылы Сәтбаев қ. әкімінің шешімімен мекеме «Ш. Ділдебаев атындағы мәдениет және шығармашылық орталығы» КМҚК болып қайта құрылды (бұқаралық атауы — Тау-кенші сарайы сақталды). Ұлытау облысы мәдениет, тілдерді дамыту және мұрағат ісі басқармасына әдістемелік бағынышты.

Бүгінде сарайда 22 шығармашылық ұжым және 758 қатысушы бар. 1975 жылдан бері «Арман» халық ән-би ансамблі жұмыс істейді — Украина, Өзбекстан, Қырғызстан гастрольдерінің лауреаты. 2014 жылдан бастап Республикалық қобызшылар байқауы, 2017 жылдан бастап Республикалық жас ақындар байқауы өткізіледі.`,
    mission: `Біздің миссиямыз — Сәтбаев қаласы мен Ұлытау облысы тұрғындарының мәдени-рухани өмірін байыту, ұлттық дәстүрді сақтау және жас таланттарды қолдау.

Біз әрбір адамның шығармашылық әлеуетін ашып, дамытуға тырысамыз — балалардан бастап ересектерге дейін.`,
    leaders: [
      { name: "Шынболат Ділдебаев (1937–1998)", title: "Сарай аты берілген тұлға", description: "Ақын-импровизатор, термеші, ҚР еңбек сіңірген мәдениет қызметкері (1991), Сәтбаев, Қызылорда, Ақтөбе қалаларының құрметті азаматы" },
      { name: "Директор", title: "Сарай директоры", description: "Лауазымды тұлға — деректер /admin/settings арқылы жаңартылады" },
    ],
  } : {
    history: `Здание построено в 1974 году в городе Сатпаев как кинотеатр «Байконур». В 2000 году после капитального ремонта учреждение переименовано в «Дворец горняков им. Ш. Дильдебаева»; в 2001 году в его составе открыт музей поэта Шынболата Дильдебаева.

В 2019 году решением акима г. Сатпаев учреждение реорганизовано в КГКП «Центр культуры и творчества им. Ш. Дильдебаева» (народное название «Дворец горняков» сохранилось). Методически подведомственно Управлению культуры, развития языков и архивного дела области Ұлытау.

Сегодня во дворце 22 творческих коллектива и 758 участников. С 1975 года работает народный ансамбль песни и танца «Арман» — лауреат гастрольных программ в Украине, Узбекистане и Киргизии. С 2014 года проводится Республиканский конкурс кобызистов, с 2017 — Республиканский конкурс молодых поэтов.`,
    mission: `Наша миссия — обогащение культурно-духовной жизни жителей города Сатпаев и области Ұлытау, сохранение национальных традиций и поддержка молодых талантов.

Мы помогаем раскрыть творческий потенциал каждого человека — от ребёнка до взрослого.`,
    leaders: [
      { name: "Шынболат Дильдебаев (1937–1998)", title: "В чью честь назван дворец", description: "Акын-импровизатор, термеши, Заслуженный работник культуры РК (1991), почётный гражданин городов Сатпаев, Кызылорда, Актобе" },
      { name: "Директор", title: "Директор дворца", description: "ФИО уточняется — обновляется через /admin/settings" },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

      {/* History */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 ornament-top pt-6">{t.history}</h2>
        <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
          {content.history}
        </div>
      </section>

      {/* Mission */}
      <section className="mb-12 bg-primary/5 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.mission}</h2>
        <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
          {content.mission}
        </div>
      </section>

      {/* Leadership */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.leadership}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.leaders.map((leader, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{leader.name}</h3>
                  <p className="text-sm text-primary">{leader.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{leader.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
