import { getOne } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendInstagramPost } from "@/lib/instagram";
import { sendFacebookLinkPost, sendFacebookPhotoPost } from "@/lib/facebook";
import { getDefaultTemplate, renderTemplate } from "@/lib/social-templates";
import { alreadyPublished, recordPublication, type SocialPlatform, type PublishKind } from "@/lib/social-publications";
import { getAllConfigs, type SocialConfig } from "@/lib/social-config";

export type { PublishKind };

async function getSetting(key: string): Promise<string | null> {
  try {
    const row = await getOne<{ value: string }>(`SELECT value FROM site_settings WHERE key = $1`, [key]);
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
  "📰 {{title_ru}}\n🇰🇿 {{title_kk}}\n\n{{excerpt_ru}}\n\nЧитать: {{url}}\n\n#ДворецГорняков #Сатпаев";
const IG_FALLBACK_EVENT =
  "🎭 {{title_ru}}\n🇰🇿 {{title_kk}}\n\n📅 {{date_ru}}\n📍 {{location}}\n\nПодробнее: {{url}}\n\n#ДворецГорняков";
const FB_FALLBACK_NEWS =
  "📰 {{title_ru}}\n🇰🇿 {{title_kk}}\n\n{{excerpt_ru}}\n\nЧитать / Оқу: {{url}}";
const FB_FALLBACK_EVENT =
  "🎭 {{title_ru}}\n🇰🇿 {{title_kk}}\n\n📅 {{date_ru}}\n📍 {{location}}\n\nПодробнее / Толығырақ: {{url}}";

interface Fallbacks { telegram: string; instagram: string; facebook: string }

async function renderForPlatform(
  platform: SocialPlatform,
  kind: "news" | "event",
  vars: Record<string, string>,
  fallback: string,
  lang: "kk" | "ru"
): Promise<string> {
  const tpl = await getDefaultTemplate(platform, kind);
  const body = lang === "kk"
    ? tpl?.body_kk || tpl?.body_ru || fallback
    : tpl?.body_ru || tpl?.body_kk || fallback;
  return renderTemplate(body, vars);
}

/** Дедуп + лог одной платформы (по образцу AIMAK). */
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

/** Общий публикатор: проходит по платформам, конфиг и креды берёт из БД (env-фолбэк в send-функциях). */
async function publishItem(opts: {
  kind: PublishKind;
  itemId: string;
  templateKind: "news" | "event";
  vars: Record<string, string>;
  img: string | null;
  url: string;
  fb: Fallbacks;
}): Promise<void> {
  const { kind, itemId, templateKind, vars, img, url, fb } = opts;
  const configs = await getAllConfigs();
  const cfg = (p: SocialPlatform): SocialConfig | undefined => configs.find((c) => c.platform === p);
  const lang = (p: SocialPlatform): "kk" | "ru" => (cfg(p)?.default_language === "ru" ? "ru" : "kk");

  const tg = cfg("telegram");
  if (tg?.enabled) {
    await runPlatform("telegram", kind, itemId, async () => {
      const text = await renderForPlatform("telegram", templateKind, vars, fb.telegram, lang("telegram"));
      return { ok: await sendTelegramMessage(text, "HTML", { token: tg.bot_token, chatId: tg.chat_id }) };
    });
  }

  const ig = cfg("instagram");
  if (ig?.enabled) {
    await runPlatform("instagram", kind, itemId, async () => {
      if (!img) return { ok: false, error: "no image_url" };
      const caption = await renderForPlatform("instagram", templateKind, vars, fb.instagram, lang("instagram"));
      return { ok: await sendInstagramPost(img, caption.slice(0, 2200), { token: ig.access_token, igUserId: ig.page_id }) };
    });
  }

  const f = cfg("facebook");
  if (f?.enabled) {
    await runPlatform("facebook", kind, itemId, async () => {
      const message = await renderForPlatform("facebook", templateKind, vars, fb.facebook, lang("facebook"));
      const creds = { pageId: f.facebook_page_id, token: f.facebook_access_token };
      const id = img ? await sendFacebookPhotoPost(img, message, creds) : await sendFacebookLinkPost(message, url, creds);
      return { ok: Boolean(id), externalId: id };
    });
  }
}

export async function publishNews(news: NewsPayload): Promise<void> {
  const base = await getBaseUrl();
  const url = `${base}/ru/news/${news.slug}`;
  await publishItem({
    kind: "news",
    itemId: news.slug,
    templateKind: "news",
    vars: {
      title_ru: news.title_ru,
      title_kk: news.title_kk,
      excerpt_ru: news.excerpt_ru,
      excerpt_kk: news.excerpt_kk,
      url,
    },
    img: absolutize(news.image_url, base),
    url,
    fb: { telegram: TG_FALLBACK_NEWS, instagram: IG_FALLBACK_NEWS, facebook: FB_FALLBACK_NEWS },
  });
}

export async function publishEvent(ev: EventPayload): Promise<void> {
  const base = await getBaseUrl();
  const url = `${base}/ru/events/${ev.id}`;
  const d = new Date(ev.start_date);
  const date_ru = d.toLocaleString("ru-RU", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Almaty" });
  const date_kk = d.toLocaleString("kk-KZ", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Almaty" });
  await publishItem({
    kind: "events",
    itemId: ev.id,
    templateKind: "event",
    vars: {
      title_ru: ev.title_ru,
      title_kk: ev.title_kk,
      date_ru,
      date_kk,
      location: ev.location || "",
      url,
    },
    img: absolutize(ev.image_url || null, base),
    url,
    fb: { telegram: TG_FALLBACK_EVENT, instagram: IG_FALLBACK_EVENT, facebook: FB_FALLBACK_EVENT },
  });
}
