import { getOne } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendInstagramPost } from "@/lib/instagram";
import { sendFacebookLinkPost, sendFacebookPhotoPost } from "@/lib/facebook";
import { getDefaultTemplate, renderTemplate } from "@/lib/social-templates";
import { alreadyPublished, recordPublication, type SocialPlatform, type PublishKind } from "@/lib/social-publications";

export type { PublishKind };

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

async function enabled(key: string): Promise<boolean> {
  return (await getSetting(key)) === "true";
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
  "📰 {{title_ru}}\n🇰🇿 {{title_kk}}\n\n{{excerpt_ru}}\n\nЧитать: {{url}}\n\n#ДворецГорняков #Сатпаев";
const IG_FALLBACK_EVENT =
  "🎭 {{title_ru}}\n🇰🇿 {{title_kk}}\n\n📅 {{date_ru}}\n📍 {{location}}\n\nПодробнее: {{url}}\n\n#ДворецГорняков";
const FB_FALLBACK_NEWS =
  "📰 {{title_ru}}\n🇰🇿 {{title_kk}}\n\n{{excerpt_ru}}\n\nЧитать / Оқу: {{url}}";
const FB_FALLBACK_EVENT =
  "🎭 {{title_ru}}\n🇰🇿 {{title_kk}}\n\n📅 {{date_ru}}\n📍 {{location}}\n\nПодробнее / Толығырақ: {{url}}";

async function renderForPlatform(
  platform: SocialPlatform,
  kind: "news" | "event",
  vars: Record<string, string>,
  fallback: string
): Promise<string> {
  const tpl = await getDefaultTemplate(platform, kind);
  const body = tpl?.body_ru || tpl?.body_kk || fallback;
  return renderTemplate(body, vars);
}

/**
 * Публикует на одну платформу с дедупом и логированием (по образцу AIMAK):
 * пропускает, если уже была успешная публикация элемента; пишет результат в журнал.
 */
async function runPlatform(
  platform: SocialPlatform,
  kind: PublishKind,
  itemId: string,
  attempt: () => Promise<{ ok: boolean; externalId?: string | null; error?: string }>
): Promise<void> {
  if (await alreadyPublished(kind, itemId, platform)) {
    console.log(`[publish] ${kind}/${itemId} → ${platform}: already published, skip`);
    return;
  }
  try {
    const { ok, externalId, error } = await attempt();
    await recordPublication(kind, itemId, platform, ok ? "success" : "failed", {
      externalId,
      error: ok ? null : error ?? "send failed",
    });
    if (!ok) console.warn(`[publish] ${kind}/${itemId} → ${platform}: ${error ?? "failed"}`);
  } catch (e) {
    await recordPublication(kind, itemId, platform, "failed", {
      error: e instanceof Error ? e.message : String(e),
    });
    console.error(`[publish] ${kind}/${itemId} → ${platform} threw:`, e);
  }
}

export async function publishNews(news: NewsPayload): Promise<void> {
  const base = await getBaseUrl();
  const url = `${base}/ru/news/${news.slug}`;
  const itemId = news.slug;
  const vars = {
    title_ru: news.title_ru,
    title_kk: news.title_kk,
    excerpt_ru: news.excerpt_ru,
    excerpt_kk: news.excerpt_kk,
    url,
  };
  const img = absolutize(news.image_url, base);

  if (await enabled("auto_telegram_news")) {
    await runPlatform("telegram", "news", itemId, async () => {
      const text = await renderForPlatform("telegram", "news", vars, TG_FALLBACK_NEWS);
      return { ok: await sendTelegramMessage(text, "HTML") };
    });
  }

  if (await enabled("auto_instagram_news")) {
    await runPlatform("instagram", "news", itemId, async () => {
      if (!img) return { ok: false, error: "no image_url" };
      const caption = await renderForPlatform("instagram", "news", vars, IG_FALLBACK_NEWS);
      return { ok: await sendInstagramPost(img, caption.slice(0, 2200)) };
    });
  }

  if (await enabled("auto_facebook_news")) {
    await runPlatform("facebook", "news", itemId, async () => {
      const message = await renderForPlatform("facebook", "news", vars, FB_FALLBACK_NEWS);
      const id = img ? await sendFacebookPhotoPost(img, message) : await sendFacebookLinkPost(message, url);
      return { ok: Boolean(id), externalId: id };
    });
  }
}

export async function publishEvent(ev: EventPayload): Promise<void> {
  const base = await getBaseUrl();
  const url = `${base}/ru/events/${ev.id}`;
  const itemId = ev.id;
  const d = new Date(ev.start_date);
  const date_ru = d.toLocaleString("ru-RU", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Almaty" });
  const date_kk = d.toLocaleString("kk-KZ", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Almaty" });
  const vars = {
    title_ru: ev.title_ru,
    title_kk: ev.title_kk,
    date_ru,
    date_kk,
    location: ev.location || "",
    url,
  };
  const img = absolutize(ev.image_url || null, base);

  if (await enabled("auto_telegram_events")) {
    await runPlatform("telegram", "events", itemId, async () => {
      const text = await renderForPlatform("telegram", "event", vars, TG_FALLBACK_EVENT);
      return { ok: await sendTelegramMessage(text, "HTML") };
    });
  }

  if (await enabled("auto_instagram_events")) {
    await runPlatform("instagram", "events", itemId, async () => {
      if (!img) return { ok: false, error: "no image_url" };
      const caption = await renderForPlatform("instagram", "event", vars, IG_FALLBACK_EVENT);
      return { ok: await sendInstagramPost(img, caption.slice(0, 2200)) };
    });
  }

  if (await enabled("auto_facebook_events")) {
    await runPlatform("facebook", "events", itemId, async () => {
      const message = await renderForPlatform("facebook", "event", vars, FB_FALLBACK_EVENT);
      const id = img ? await sendFacebookPhotoPost(img, message) : await sendFacebookLinkPost(message, url);
      return { ok: Boolean(id), externalId: id };
    });
  }
}
