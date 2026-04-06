const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[];
    };
  }[];
  error?: { message: string };
}

export async function chatWithGemini(
  messages: GeminiMessage[],
  systemPrompt?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return "AI сервис қазір қолжетімсіз / AI сервис временно недоступен";
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

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data: GeminiResponse = await response.json();

  if (data.error) {
    console.error("Gemini API error:", data.error.message);
    return "AI сервис қазір қолжетімсіз / AI сервис временно недоступен";
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Жауап алу мүмкін болмады";
}

export async function translateText(
  text: string,
  fromLang: "kk" | "ru",
  toLang: "kk" | "ru"
): Promise<string> {
  const langNames = { kk: "Kazakh", ru: "Russian" };
  const prompt = `Translate the following text from ${langNames[fromLang]} to ${langNames[toLang]}. Return only the translated text, nothing else:\n\n${text}`;

  return chatWithGemini([{ role: "user", parts: [{ text: prompt }] }]);
}

export async function recommendClubs(
  answers: Record<string, string>,
  clubs: { name_kk: string; name_ru: string; description_ru: string; age_group: string; direction: string }[]
): Promise<string> {
  const systemPrompt = `You are a helpful assistant for Dvorets Gornyakov cultural palace in Zhezkazgan, Kazakhstan.
Based on the user's answers to a quiz, recommend the most suitable clubs from the available list.
Respond in Russian. Format your response as a friendly recommendation with explanations.`;

  const userMessage = `Quiz answers: ${JSON.stringify(answers)}

Available clubs: ${JSON.stringify(clubs)}

Please recommend 1-3 most suitable clubs and explain why.`;

  return chatWithGemini(
    [{ role: "user", parts: [{ text: userMessage }] }],
    systemPrompt
  );
}
