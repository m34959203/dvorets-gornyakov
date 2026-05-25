import { logGeneration } from "@/lib/ai-usage";
import type { GeminiTool, GeminiToolResult } from "@/lib/gemini";

// Groq Cloud (OpenAI-совместимый API) — primary-провайдер function calling,
// если задан GROQ_API_KEY. Бесплатный free-tier, модель llama-3.3-70b-versatile.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

interface InMsg {
  role: "user" | "model";
  parts: { text: string }[];
}

export function hasGroq(): boolean {
  return Boolean(process.env.GROQ_API_KEY) && process.env.AI_DISABLED !== "1";
}

interface GroqResponse {
  choices?: {
    message?: {
      content?: string | null;
      tool_calls?: { function?: { name: string; arguments: string } }[];
    };
  }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  error?: { message?: string };
}

export async function chatWithGroqTools(
  messages: InMsg[],
  systemPrompt: string,
  tools: GeminiTool[],
  options: { purpose?: string; userId?: string | null } = {}
): Promise<GeminiToolResult> {
  const purpose = options.purpose ?? "chatbot";
  const userId = options.userId ?? null;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  // Конвертация: Gemini-формат → OpenAI; tools → OpenAI function-формат.
  const oaiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role === "model" ? "assistant" : "user", content: m.parts.map((p) => p.text).join("\n") })),
  ];
  const oaiTools = tools.map((t) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } }));

  const start = Date.now();
  let success = false;
  let errorMsg: string | null = null;
  try {
    const r = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model, messages: oaiMessages, tools: oaiTools, tool_choice: "auto", temperature: 0.4, max_tokens: 1024 }),
    });
    const data: GroqResponse = await r.json();
    if (data.error) {
      errorMsg = data.error.message ?? "groq_error";
      return { kind: "text", text: "AI сервис временно недоступен / AI сервис қазір қолжетімсіз" };
    }
    const msg = data.choices?.[0]?.message;
    const call = msg?.tool_calls?.[0]?.function;
    success = true;
    if (call) {
      let args: Record<string, unknown> = {};
      try { args = JSON.parse(call.arguments || "{}"); } catch { /* leave empty → handler validation */ }
      return { kind: "call", name: call.name, args };
    }
    return { kind: "text", text: (msg?.content || "").trim() || "…" };
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    return { kind: "text", text: "AI сервис временно недоступен / AI сервис қазір қолжетімсіз" };
  } finally {
    await logGeneration({ model, purpose, userId, durationMs: Date.now() - start, success, error: errorMsg });
  }
}
