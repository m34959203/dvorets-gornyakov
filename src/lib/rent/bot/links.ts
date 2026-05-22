import { getMany } from "@/lib/db";

export interface BotLinks {
  whatsapp?: string;
}

/**
 * Диплинк для бронирования через WhatsApp-бота.
 * Номер: site_settings.whatsapp_phone (автозаполняется при привязке номера
 * в админке /admin/wa) с фолбэком на env WHATSAPP_PHONE.
 * wa.me/<digits>?text=/start rent_<slug> — встроенный бот распознаёт /start с payload.
 */
export async function getBotLinks(hallSlug: string): Promise<BotLinks> {
  let waPhone = process.env.WHATSAPP_PHONE ?? "";

  try {
    const rows = await getMany<{ key: string; value: string }>(
      `SELECT key, value FROM site_settings WHERE key = 'whatsapp_phone'`
    );
    for (const r of rows) {
      if (r.value && r.value.trim()) waPhone = r.value.trim();
    }
  } catch {
    /* settings optional */
  }

  const links: BotLinks = {};
  const digits = waPhone.replace(/\D/g, "");
  if (digits) {
    links.whatsapp = `https://wa.me/${digits}?text=${encodeURIComponent(`/start rent_${hallSlug}`)}`;
  }
  return links;
}
