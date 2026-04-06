import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{messages.common.rules}</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ol className="space-y-4">
          {rules.map((rule, i) => (
            <li key={i} className="flex gap-4">
              <span className="shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                {i + 1}
              </span>
              <span className="text-gray-700 pt-1">{rule}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
