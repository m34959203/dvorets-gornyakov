import { NextRequest } from "next/server";
import { chatWithGemini } from "@/lib/gemini";
import { chatbotSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = parseBody(chatbotSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const { message, locale, history } = parsed.data;

    // Build context from knowledge base (in production, query DB)
    const knowledgeContext = `
You are a helpful assistant for Dvorets Gornyakov (Дворец горняков им. Ш. Дільдебаева) — a cultural palace in Zhezkazgan, Kazakhstan.

Key information:
- Address: г. Жезказган, пр. Абая, 10
- Phone: +7 (7102) 77-77-77
- Working hours: Mon-Fri 09:00-18:00, Sat-Sun 10:00-17:00
- Available clubs: Vocal studio, Folk dances, Modern dances, Art studio, Theater studio, Dombra circle, Piano, Crafts studio
- Website sections: News, Clubs, Events, About, Contacts, Resources, Rules

Rules:
- Respond in ${locale === "kk" ? "Kazakh" : "Russian"} language
- Be friendly and helpful
- If asked about enrollment, direct to the clubs page or phone number
- If you don't know something specific, suggest contacting administration
- Keep responses concise (2-4 sentences typically)
`;

    const messages = (history || []).map((h) => ({
      role: h.role as "user" | "model",
      parts: [{ text: h.text }],
    }));

    messages.push({ role: "user", parts: [{ text: message }] });

    const reply = await chatWithGemini(messages, knowledgeContext);

    return apiSuccess({ reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    return apiError("Internal server error", 500);
  }
}
