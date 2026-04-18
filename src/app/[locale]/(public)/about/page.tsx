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
      ? "Ш. Ділдебаев атындағы тау-кенші сарайының тарихы, миссиясы және жетекшілігі — 1960 жылдан бері Жезқазған қаласының мәдени орталығы."
      : "История, миссия и руководство Дворца горняков им. Ш. Дільдебаева — культурного центра города Жезказган с 1960 года.";
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
    history: `Ш. Ділдебаев атындағы тау-кенші сарайы 1960 жылы Жезқазған қаласында ашылған. Сарай алғашқы күнінен бастап қала тұрғындарының мәдени өмірінің орталығына айналды.

Жылдар бойы сарай мыңдаған балалар мен ересектерге шығармашылық бағыттар бойынша білім берді. Біздің түлектер ел мақтанышы — олимпиада жеңімпаздары, танымал әртістер мен суретшілер.

Бүгінде сарайда 20-дан астам үйірме мен студия жұмыс істейді. Біз заманауи білім беру әдістемелерін қолданып, әрбір баланың таланттарын ашуға көмектесеміз.`,
    mission: `Біздің миссиямыз — Жезқазған қаласы мен аймақ тұрғындарының мәдени-рухани өмірін байыту, шығармашылық қабілеттерін дамыту, ұлттық мәдениетті насихаттау.

Біз әрбір адамның — балалар мен ересектердің — шығармашылық әлеуетін ашып, дамытуға тырысамыз.`,
    leaders: [
      { name: "Директор", title: "Сарай директоры", description: "Мәдениет саласында 20 жылдан астам тәжірибе" },
      { name: "Көркемдік жетекші", title: "Көркемдік жетекші", description: "Шығармашылық бағдарламалардың басшысы" },
    ],
  } : {
    history: `Дворец горняков им. Ш. Дільдебаева был открыт в 1960 году в городе Жезказган. С первых дней дворец стал центром культурной жизни горожан.

На протяжении многих лет дворец обучил тысячи детей и взрослых творческим направлениям. Наши выпускники — гордость страны: победители олимпиад, известные артисты и художники.

Сегодня во дворце работают более 20 кружков и студий. Мы используем современные методики обучения и помогаем раскрыть таланты каждого ребёнка.`,
    mission: `Наша миссия — обогащение культурно-духовной жизни жителей города Жезказган и региона, развитие творческих способностей, пропаганда национальной культуры.

Мы стремимся раскрыть и развить творческий потенциал каждого человека — детей и взрослых.`,
    leaders: [
      { name: "Директор", title: "Директор дворца", description: "Более 20 лет опыта в сфере культуры" },
      { name: "Художественный руководитель", title: "Художественный руководитель", description: "Руководитель творческих программ" },
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
