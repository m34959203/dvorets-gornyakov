import { getMany } from "@/lib/db";

export interface BotLinks {
  telegram?: string;
  whatsapp?: string;
}

/**
 * Диплинки для бронирования через бота.
 * Источник имени бота / номера WA: site_settings (telegram_bot_username,
 * whatsapp_phone) с фолбэком на env (TELEGRAM_BOT_USERNAME, WHATSAPP_PHONE).
 * Telegram: t.me/<bot>?start=rent_<slug>. WhatsApp: wa.me/<digits>?text=/start rent_<slug>
 * (гейт пересылает текст вебхуку, бот распознаёт /start с payload).
 */
export async function getBotLinks(hallSlug: string): Promise<BotLinks> {
  let tgUser = process.env.TELEGRAM_BOT_USERNAME ?? "";
  let waPhone = process.env.WHATSAPP_PHONE ?? "";

  try {
    const rows = await getMany<{ key: string; value: string }>(
      `SELECT key, value FROM site_settings WHERE key IN ('telegram_bot_username','whatsapp_phone')`
    );
    for (const r of rows) {
      if (r.value && r.value.trim()) {
        if (r.key === "telegram_bot_username") tgUser = r.value.trim();
        if (r.key === "whatsapp_phone") waPhone = r.value.trim();
      }
    }
  } catch {
    /* settings optional */
  }

  const links: BotLinks = {};
  const user = tgUser.replace(/^@/, "").trim();
  if (user) links.telegram = `https://t.me/${user}?start=rent_${hallSlug}`;

  const digits = waPhone.replace(/\D/g, "");
  if (digits) {
    links.whatsapp = `https://wa.me/${digits}?text=${encodeURIComponent(`/start rent_${hallSlug}`)}`;
  }
  return links;
}
