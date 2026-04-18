import { getOne } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";

export type PublishKind = "news" | "events";

async function getSetting(key: string): Promise<string | null> {
  try {
    const row = await getOne<{ value: string }>(
      `SELECT value FROM site_settings WHERE key = $1`,
      [key]
    );
    return row?.value ?? null;
  } catch {
    return null;
  }
}

async function getBaseUrl(): Promise<string> {
  const stored = await getSetting("site_base_url");
  return stored || process.env.NEXT_PUBLIC_APP_URL || "https://dvorets-gornyakov.kz";
}

function escapeHtml(text: string): string {
  return (text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface NewsPayload {
  slug: string;
  title_ru: string;
  title_kk: string;
  excerpt_ru: string;
  excerpt_kk: string;
  image_url: string | null;
}

export interface EventPayload {
  id: string;
  title_ru: string;
  title_kk: string;
  start_date: string | Date;
  location: string;
  event_type: string;
}

export async function publishNews(news: NewsPayload): Promise<void> {
  const flag = await getSetting("auto_telegram_news");
  if (flag !== "true") return;
  const base = await getBaseUrl();
  const url = `${base}/ru/news/${news.slug}`;
  const text =
    `📰 <b>${escapeHtml(news.title_ru)}</b>\n` +
    `🇰🇿 <b>${escapeHtml(news.title_kk)}</b>\n\n` +
    (news.excerpt_ru ? `${escapeHtml(news.excerpt_ru)}\n\n` : "") +
    `<a href="${url}">Читать / Оқу</a>`;
  const ok = await sendTelegramMessage(text, "HTML");
  if (!ok) console.warn("[publish] Telegram news skipped");
}

export async function publishEvent(ev: EventPayload): Promise<void> {
  const flag = await getSetting("auto_telegram_events");
  if (flag !== "true") return;
  const base = await getBaseUrl();
  const url = `${base}/ru/events/${ev.id}`;
  const date = new Date(ev.start_date).toLocaleString("ru-RU", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Almaty",
  });
  const text =
    `🎭 <b>${escapeHtml(ev.title_ru)}</b>\n` +
    `🇰🇿 <b>${escapeHtml(ev.title_kk)}</b>\n\n` +
    `📅 ${escapeHtml(date)}\n` +
    (ev.location ? `📍 ${escapeHtml(ev.location)}\n` : "") +
    `\n<a href="${url}">Подробнее / Толығырақ</a>`;
  const ok = await sendTelegramMessage(text, "HTML");
  if (!ok) console.warn("[publish] Telegram event skipped");
}
