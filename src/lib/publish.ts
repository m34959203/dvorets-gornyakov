import { getOne } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendInstagramPost } from "@/lib/instagram";
import { getDefaultTemplate, renderTemplate } from "@/lib/social-templates";

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

function absolutize(url: string | null, base: string): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${base.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
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
  image_url?: string | null;
}

const TG_FALLBACK_NEWS =
  '📰 <b>{{title_ru}}</b>\n🇰🇿 <b>{{title_kk}}</b>\n\n{{excerpt_ru}}\n\n<a href="{{url}}">Читать / Оқу</a>';
const TG_FALLBACK_EVENT =
  '🎭 <b>{{title_ru}}</b>\n🇰🇿 <b>{{title_kk}}</b>\n\n📅 {{date_ru}}\n📍 {{location}}\n\n<a href="{{url}}">Подробнее / Толығырақ</a>';
const IG_FALLBACK_NEWS =
  "📰 {{title_ru}}\n🇰🇿 {{title_kk}}\n\n{{excerpt_ru}}\n\nЧитать: {{url}}\n\n#ДворецГорняков #Жезказган";
const IG_FALLBACK_EVENT =
  "🎭 {{title_ru}}\n🇰🇿 {{title_kk}}\n\n📅 {{date_ru}}\n📍 {{location}}\n\nПодробнее: {{url}}\n\n#ДворецГорняков";

async function renderForPlatform(
  platform: "telegram" | "instagram",
  kind: "news" | "event",
  vars: Record<string, string>,
  fallback: string
): Promise<string> {
  const tpl = await getDefaultTemplate(platform, kind);
  const body = tpl?.body_ru || tpl?.body_kk || fallback;
  return renderTemplate(body, vars);
}

export async function publishNews(news: NewsPayload): Promise<void> {
  const base = await getBaseUrl();
  const url = `${base}/ru/news/${news.slug}`;
  const vars = {
    title_ru: news.title_ru,
    title_kk: news.title_kk,
    excerpt_ru: news.excerpt_ru,
    excerpt_kk: news.excerpt_kk,
    url,
  };

  if ((await getSetting("auto_telegram_news")) === "true") {
    const text = await renderForPlatform("telegram", "news", vars, TG_FALLBACK_NEWS);
    const ok = await sendTelegramMessage(text, "HTML");
    if (!ok) console.warn("[publish] Telegram news skipped");
  }

  if ((await getSetting("auto_instagram_news")) === "true") {
    const img = absolutize(news.image_url, base);
    if (img) {
      const caption = await renderForPlatform("instagram", "news", vars, IG_FALLBACK_NEWS);
      const ok = await sendInstagramPost(img, caption.slice(0, 2200));
      if (!ok) console.warn("[publish] Instagram news skipped");
    } else {
      console.warn("[publish] Instagram news skipped — no image_url");
    }
  }
}

export async function publishEvent(ev: EventPayload): Promise<void> {
  const base = await getBaseUrl();
  const url = `${base}/ru/events/${ev.id}`;
  const d = new Date(ev.start_date);
  const date_ru = d.toLocaleString("ru-RU", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Almaty",
  });
  const date_kk = d.toLocaleString("kk-KZ", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Almaty",
  });
  const vars = {
    title_ru: ev.title_ru,
    title_kk: ev.title_kk,
    date_ru,
    date_kk,
    location: ev.location || "",
    url,
  };

  if ((await getSetting("auto_telegram_events")) === "true") {
    const text = await renderForPlatform("telegram", "event", vars, TG_FALLBACK_EVENT);
    const ok = await sendTelegramMessage(text, "HTML");
    if (!ok) console.warn("[publish] Telegram event skipped");
  }

  if ((await getSetting("auto_instagram_events")) === "true") {
    const img = absolutize(ev.image_url || null, base);
    if (img) {
      const caption = await renderForPlatform("instagram", "event", vars, IG_FALLBACK_EVENT);
      const ok = await sendInstagramPost(img, caption.slice(0, 2200));
      if (!ok) console.warn("[publish] Instagram event skipped");
    } else {
      console.warn("[publish] Instagram event skipped — no image_url");
    }
  }
}
