import type { BotOption } from "./engine";

/**
 * WhatsApp: отправка через внешний Baileys-гейт (резервный путь).
 * Основной WA-канал — встроенный сокет (src/lib/wa/runtime.ts), который
 * отвечает напрямую. Эта функция оставлена для опционального внешнего гейта.
 * Опции рендерятся нумерованным списком — пользователь отвечает цифрой.
 */
export async function waSend(to: string, text: string, options?: BotOption[]): Promise<void> {
  const url = process.env.WA_GATEWAY_SEND_URL;
  if (!url) {
    console.warn("[bot] WA_GATEWAY_SEND_URL not set");
    return;
  }
  let message = text;
  if (options && options.length) {
    message += "\n\n" + options.map((o, i) => `${i + 1}. ${o.label}`).join("\n");
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.WA_GATEWAY_TOKEN) headers["Authorization"] = `Bearer ${process.env.WA_GATEWAY_TOKEN}`;
  try {
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify({ to, message }) });
    if (!res.ok) console.error("[bot] waSend http", res.status, await res.text());
  } catch (e) {
    console.error("[bot] waSend error:", e);
  }
}
