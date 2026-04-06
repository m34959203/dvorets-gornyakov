const TELEGRAM_API = "https://api.telegram.org/bot";

interface TelegramResult {
  ok: boolean;
  description?: string;
}

export async function sendTelegramMessage(text: string, parseMode: "HTML" | "Markdown" = "HTML"): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!token || !channelId) {
    console.warn("Telegram not configured");
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channelId,
        text,
        parse_mode: parseMode,
      }),
    });

    const result: TelegramResult = await response.json();
    if (!result.ok) {
      console.error("Telegram error:", result.description);
    }
    return result.ok;
  } catch (error) {
    console.error("Telegram send error:", error);
    return false;
  }
}

export async function sendTelegramPhoto(
  photoUrl: string,
  caption: string
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!token || !channelId) return false;

  try {
    const response = await fetch(`${TELEGRAM_API}${token}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channelId,
        photo: photoUrl,
        caption,
        parse_mode: "HTML",
      }),
    });

    const result: TelegramResult = await response.json();
    return result.ok;
  } catch (error) {
    console.error("Telegram photo error:", error);
    return false;
  }
}

export function formatNewsForTelegram(
  title: string,
  excerpt: string,
  url: string
): string {
  return `📰 <b>${escapeHtml(title)}</b>\n\n${escapeHtml(excerpt)}\n\n<a href="${url}">Толығырақ оқу / Читать далее</a>`;
}

export function formatEventForTelegram(
  title: string,
  date: string,
  location: string,
  url: string
): string {
  return `🎭 <b>${escapeHtml(title)}</b>\n\n📅 ${escapeHtml(date)}\n📍 ${escapeHtml(location)}\n\n<a href="${url}">Толығырақ / Подробнее</a>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
