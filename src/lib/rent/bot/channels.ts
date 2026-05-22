import type { BotOption } from "./engine";

const TG_API = "https://api.telegram.org/bot";

/** Telegram: отправка сообщения с inline-кнопками (по одной в ряд). */
export async function tgSend(chatId: number | string, text: string, options?: BotOption[]): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("[bot] TELEGRAM_BOT_TOKEN not set");
    return;
  }
  const body: Record<string, unknown> = { chat_id: chatId, text, parse_mode: "HTML" };
  if (options && options.length) {
    body.reply_markup = {
      inline_keyboard: options.map((o) => [{ text: o.label, callback_data: o.value }]),
    };
  }
  try {
    const res = await fetch(`${TG_API}${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error("[bot] tgSend http", res.status, await res.text());
  } catch (e) {
    console.error("[bot] tgSend error:", e);
  }
}

export async function tgAnswerCallback(callbackId: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  try {
    await fetch(`${TG_API}${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackId }),
    });
  } catch {
    /* ignore */
  }
}

/**
 * WhatsApp: отправка через Baileys-гейт (как в других проектах).
 * Опции рендерятся нумерованным списком — пользователь отвечает цифрой.
 * Контракт гейта: POST {WA_GATEWAY_SEND_URL} { to, message } + Bearer WA_GATEWAY_TOKEN.
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
