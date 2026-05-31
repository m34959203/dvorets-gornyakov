import type { Metadata } from "next";
import { getSiteBaseUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";
import { isValidLocale, type Locale } from "@/lib/i18n";
import DgPageHero from "@/components/layout/DgPageHero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: lp } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const base = await getSiteBaseUrl();
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
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

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
    <div className="dg-home">
      <DgPageHero
        crumbs={[
          { label: T("Басты бет", "Главная"), href: `/${locale}` },
          { label: T("Келу ережелері", "Правила посещения") },
        ]}
        tag={T("— Ережелер —", "— Правила —")}
        h2Html={T("Сарайға <strong>келу ережелері</strong>", "Правила <strong>посещения</strong> Дворца")}
        lead={T(
          "Барлық қонақтарға ыңғайлы болуы үшін қарапайым ережелерді сақтауыңызды сұраймыз.",
          "Чтобы всем гостям было комфортно, просим соблюдать несколько простых правил."
        )}
      />
      <section className="section section--light">
        <div className="dg-wrap">
          <ol className="rules-list">
            {rules.map((rule, i) => (
              <li key={i}>
                <span className="num">{i + 1}</span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
