import { NextRequest } from "next/server";
import { chatWithGemini } from "@/lib/gemini";
import { chatbotSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";
import { getMany } from "@/lib/db";

const UNAVAILABLE_MARKERS = [
  "AI сервис",
  "временно недоступен",
  "қолжетімсіз",
  "Resource exhausted",
];

interface KbRow {
  question_kk: string;
  question_ru: string;
  answer_kk: string;
  answer_ru: string;
}

const HARDCODED_KB: KbRow[] = [
  {
    question_ru: "адрес",
    question_kk: "мекенжай",
    answer_ru: "Мы находимся в г. Сатпаев, пр. К.И. Сатпаева, 106 (бывший к/т «Байконур»).",
    answer_kk: "Біз Сәтбаев қ., Қ.И. Сәтбаев д-лы, 106 мекенжайында орналасқанбыз.",
  },
  {
    question_ru: "телефон",
    question_kk: "телефон",
    answer_ru: "Приёмная: +7 (71063) 6-23-30, касса: +7 (71063) 6-24-40.",
    answer_kk: "Қабылдау: +7 (71063) 6-23-30, касса: +7 (71063) 6-24-40.",
  },
  {
    question_ru: "часы работы время работает открыт",
    question_kk: "жұмыс уақыты ашық",
    answer_ru: "Пн–Пт: 09:00–18:30. Сб–Вс: по афише мероприятий.",
    answer_kk: "Дс–Жм: 09:00–18:30. Сн–Жс: іс-шара бағдарламасы бойынша.",
  },
  {
    question_ru: "кружки студии записать запись",
    question_kk: "үйірмелер студиялар жазылу",
    answer_ru: "У нас 22 творческих коллектива: вокал, народные танцы, изостудия, театр, ансамбль «Арман» и др. Запись онлайн на странице «Кружки».",
    answer_kk: "Біздерде 22 шығармашылық ұжым: вокал, халық билері, бейнелеу, театр, «Арман» ансамблі және т.б. Онлайн жазылу «Үйірмелер» бетінде.",
  },
  {
    question_ru: "аренда зал забронировать прайс цена стоимость",
    question_kk: "жалдау зал брондау баға",
    answer_ru: "3 зала для аренды: Большой (650 мест), Камерный (120), Репетиционный (40). Подать заявку — на странице «Аренда залов».",
    answer_kk: "Жалдауға 3 зал: Үлкен (650 орын), Камералық (120), Жаттығу (40). Өтінім — «Залдарды жалдау» бетінде.",
  },
  {
    question_ru: "события афиша мероприятия концерт билет",
    question_kk: "афиша іс-шара концерт билет",
    answer_ru: "Актуальная афиша — на странице «События». Большинство мероприятий вход свободный или по партнёрской программе.",
    answer_kk: "Ағымдағы афиша — «Іс-шаралар» бетінде. Көпшілік іс-шаралар тегін немесе серіктестік бағдарлама бойынша.",
  },
  {
    question_ru: "дильдебаев шынболат ш.",
    question_kk: "ділдебаев шынболат",
    answer_ru: "Шынболат Нурғазыұлы Дильдебаев (1937–1998) — казахский акын-импровизатор, Заслуженный работник культуры РК (1991), в чью честь назван дворец.",
    answer_kk: "Шынболат Нұрғазыұлы Ділдебаев (1937–1998) — қазақ ақын-импровизаторы, ҚР еңбек сіңірген мәдениет қызметкері (1991).",
  },
];

function simpleKbMatch(question: string, kb: KbRow[], locale: "kk" | "ru"): string | null {
  const q = question.toLowerCase();
  let best: { score: number; answer: string } | null = null;
  for (const row of kb) {
    const keys = (locale === "kk" ? row.question_kk : row.question_ru) || "";
    if (!keys) continue;
    const tokens = keys.toLowerCase().split(/\s+/).filter((t) => t.length >= 3);
    let score = 0;
    for (const tok of tokens) {
      if (q.includes(tok)) score++;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: locale === "kk" ? row.answer_kk : row.answer_ru };
    }
  }
  return best ? best.answer : null;
}

async function loadKb(): Promise<KbRow[]> {
  try {
    return await getMany<KbRow>(
      `SELECT question_kk, question_ru, answer_kk, answer_ru FROM chatbot_knowledge ORDER BY created_at DESC`
    );
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = parseBody(chatbotSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const { message, locale, history } = parsed.data;
    const lang: "kk" | "ru" = locale === "kk" ? "kk" : "ru";

    const knowledgeContext = `
You are a helpful assistant for the cultural palace КГКП «Дворец горняков им. Ш. Дильдебаева» (бытовое название) / КГКП «Центр культуры и творчества им. Ш. Дильдебаева» (юр.).

Key information:
- City: г. Сатпаев, Ұлытауская обл., Казахстан
- Address: пр. К.И. Сатпаева, 106 (бывший к/т «Байконур», 1974)
- Phone: +7 (71063) 6-23-30 (приёмная), 6-24-40 (касса)
- Working hours: Mon–Fri 09:00–18:30, Sat–Sun по афише
- 22 творческих коллектива, 758 участников; ансамбль «Арман» с 1975
- История: 1974 (к/т «Байконур») → 2000 (Дворец горняков) → 2019 (КГКП)
- Шынболат Нұрғазыұлы Дильдебаев (1937–1998) — акын-импровизатор, в чью честь назван дворец
- Все события — бесплатные или партнёрские
- 3 зала для аренды: Большой (650), Камерный (120), Репетиционный (40)

Rules:
- Respond in ${lang === "kk" ? "Kazakh" : "Russian"} language
- Be friendly and helpful
- Keep responses concise (2–4 sentences typically)
- If asked about enrollment, direct to the clubs page or phone
`;

    const msgs = (history || []).map((h) => ({
      role: h.role as "user" | "model",
      parts: [{ text: h.text }],
    }));
    msgs.push({ role: "user", parts: [{ text: message }] });

    const reply = await chatWithGemini(msgs, knowledgeContext, { purpose: "chatbot" });

    // Fallback: если Gemini вернул заглушку «недоступен» — пробуем KB (БД + hardcoded)
    const looksUnavailable = UNAVAILABLE_MARKERS.some((m) => reply.includes(m));
    if (looksUnavailable) {
      const dbKb = await loadKb();
      const kbHit = simpleKbMatch(message, dbKb, lang) || simpleKbMatch(message, HARDCODED_KB, lang);
      if (kbHit) return apiSuccess({ reply: kbHit });
      // последний резерв
      return apiSuccess({
        reply:
          lang === "kk"
            ? "Кешіріңіз, қазір толық жауап бере алмаймын. Қабылдауға хабарласыңыз: +7 (71063) 6-23-30."
            : "Извините, сейчас не могу дать полный ответ. Позвоните в приёмную: +7 (71063) 6-23-30.",
      });
    }

    return apiSuccess({ reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    return apiError("Internal server error", 500);
  }
}
