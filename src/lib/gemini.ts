import { logGeneration, withinBudget } from "@/lib/ai-usage";

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[];
    };
  }[];
  usageMetadata?: GeminiUsageMetadata;
  error?: { message: string };
}

const BUDGET_EXCEEDED_REPLY =
  "AI бюджеті таусылды / AI лимит бюджета исчерпан";
const UNAVAILABLE_REPLY =
  "AI сервис қазір қолжетімсіз / AI сервис временно недоступен";
const FALLBACK_REPLY = "Жауап алу мүмкін болмады";

export interface ChatOptions {
  purpose?: string;
  userId?: string | null;
}

export async function chatWithGemini(
  messages: GeminiMessage[],
  systemPrompt?: string,
  options: ChatOptions = {}
): Promise<string> {
  const purpose = options.purpose ?? "other";
  const userId = options.userId ?? null;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // No key at all — log as failure, do not hit network
    await logGeneration({
      model: GEMINI_MODEL,
      purpose,
      userId,
      durationMs: 0,
      success: false,
      error: "no_api_key",
    });
    return UNAVAILABLE_REPLY;
  }

  // Budget guard — short-circuit before hitting Gemini
  const ok = await withinBudget();
  if (!ok) {
    await logGeneration({
      model: GEMINI_MODEL,
      purpose,
      userId,
      durationMs: 0,
      success: false,
      error: "budget_exceeded",
    });
    return BUDGET_EXCEEDED_REPLY;
  }

  const body: Record<string, unknown> = {
    contents: messages,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
  };

  if (systemPrompt) {
    body.systemInstruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  const startTime = Date.now();
  let success = false;
  let errorMsg: string | null = null;
  let promptTokens: number | null = null;
  let completionTokens: number | null = null;
  let totalTokens: number | null = null;
  let reply = FALLBACK_REPLY;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data: GeminiResponse = await response.json();

    if (data.error) {
      console.error("Gemini API error:", data.error.message);
      errorMsg = data.error.message;
      reply = UNAVAILABLE_REPLY;
    } else {
      reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ?? FALLBACK_REPLY;
      success = true;
    }

    const usage = data.usageMetadata;
    if (usage) {
      promptTokens =
        typeof usage.promptTokenCount === "number"
          ? usage.promptTokenCount
          : null;
      completionTokens =
        typeof usage.candidatesTokenCount === "number"
          ? usage.candidatesTokenCount
          : null;
      totalTokens =
        typeof usage.totalTokenCount === "number"
          ? usage.totalTokenCount
          : null;
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Gemini request failed:", errorMsg);
    reply = UNAVAILABLE_REPLY;
  } finally {
    await logGeneration({
      model: GEMINI_MODEL,
      purpose,
      userId,
      promptTokens,
      completionTokens,
      totalTokens,
      durationMs: Date.now() - startTime,
      success,
      error: errorMsg,
    });
  }

  return reply;
}

export async function translateText(
  text: string,
  fromLang: "kk" | "ru",
  toLang: "kk" | "ru",
  options: ChatOptions = {}
): Promise<string> {
  const langNames = { kk: "Kazakh", ru: "Russian" };
  const prompt = `Translate the following text from ${langNames[fromLang]} to ${langNames[toLang]}. Return only the translated text, nothing else:\n\n${text}`;

  return chatWithGemini(
    [{ role: "user", parts: [{ text: prompt }] }],
    undefined,
    { purpose: "translate", ...options }
  );
}

export async function recommendClubs(
  answers: Record<string, string>,
  clubs: { name_kk: string; name_ru: string; description_ru: string; age_group: string; direction: string }[],
  options: ChatOptions = {}
): Promise<string> {
  const systemPrompt = `You are a helpful assistant for Dvorets Gornyakov cultural palace in Zhezkazgan, Kazakhstan.
Based on the user's answers to a quiz, recommend the most suitable clubs from the available list.
Respond in Russian. Format your response as a friendly recommendation with explanations.`;

  const userMessage = `Quiz answers: ${JSON.stringify(answers)}

Available clubs: ${JSON.stringify(clubs)}

Please recommend 1-3 most suitable clubs and explain why.`;

  return chatWithGemini(
    [{ role: "user", parts: [{ text: userMessage }] }],
    systemPrompt,
    { purpose: "recommend", ...options }
  );
}
