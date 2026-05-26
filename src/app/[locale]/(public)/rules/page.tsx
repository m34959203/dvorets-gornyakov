import type { Metadata } from "next";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: lp } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const base = (process.env.NEXT_PUBLIC_APP_URL || "https://dvorets-gornyakov.kz").replace(/\/$/, "");
  const title = locale === "kk" ? "Келу ережелері" : "Правила посещения";
  const description =
    locale === "kk"
      ? "Тау-кеншілер сарайына келу ережелері: жұмыс уақыты, кіру, фото- және бейнетүсіру."
      : "Правила посещения Дворца горняков: часы работы, вход, фото- и видеосъёмка.";
  return {
    title,
    description,
    alternates: {
      canonical: `${base}/${locale}/rules`,
      languages: { kk: `${base}/kk/rules`, ru: `${base}/ru/rules` },
    },
    openGraph: { title, description, type: "website", images: [{ url: "/photos/og-cover.jpg", width: 1200, height: 630 }] },
  };
}

export default async function RulesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);

  const rules = locale === "kk" ? [
    "Сарайға кіру тегін (арнайы іс-шараларды қоспағанда).",
    "Сарай жұмыс уақыты: Дс-Жм 09:00-18:00, Сн-Жс 10:00-17:00.",
    "Балаларды (14 жасқа дейін) ата-аналары немесе заңды өкілдері алып жүруі тиіс.",
    "Сарай ішінде тыныштық пен тәртіпті сақтау керек.",
    "Темекі шегу мен алкогольді ішімдіктер ішуге тыйым салынады.",
    "Жеке заттарыңызды қадағалаңыз — әкімшілік жоғалған заттар үшін жауап бермейді.",
    "Концерт залына іс-шара басталғаннан 15 минут бұрын кіру керек.",
    "Үйірмелер мен студияларға жазылу әкімшілік арқылы жүзеге асырылады.",
    "Фото- және бейнетүсіруге рұқсат алу қажет.",
    "Төтенше жағдайларда қызметкерлердің нұсқауларын орындаңыз.",
  ] : [
    "Вход во дворец бесплатный (за исключением специальных мероприятий).",
    "Время работы дворца: Пн-Пт 09:00-18:00, Сб-Вс 10:00-17:00.",
    "Дети (до 14 лет) должны сопровождаться родителями или законными представителями.",
    "Необходимо соблюдать тишину и порядок внутри дворца.",
    "Запрещается курение и употребление алкогольных напитков.",
    "Следите за личными вещами — администрация не несёт ответственности за утерянные вещи.",
    "В концертный зал необходимо войти за 15 минут до начала мероприятия.",
    "Запись в кружки и студии осуществляется через администрацию.",
    "Для фото- и видеосъёмки необходимо получить разрешение.",
    "В экстренных ситуациях следуйте указаниям персонала.",
  ];

  return (
    <div style={{ background: "#0E0E20", minHeight: "calc(100vh - 84px)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "#fff" }}>{messages.common.rules}</h1>

        <div className="rounded-xl p-6" style={{ background: "#15152a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <ol className="space-y-4">
            {rules.map((rule, i) => (
              <li key={i} className="flex gap-4">
                <span
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(224,122,74,0.14)", color: "#E07A4A" }}
                >
                  {i + 1}
                </span>
                <span className="pt-1" style={{ color: "#cbd2dc" }}>{rule}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
