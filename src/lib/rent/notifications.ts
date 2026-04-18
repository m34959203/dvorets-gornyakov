import { sendTelegramMessage } from "@/lib/telegram";
import type { RentalRequest } from "@/lib/rent/types";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function notifyRentalRequest(
  req: RentalRequest,
  hallName: string
): Promise<void> {
  const text =
    `🏛 <b>Новая заявка на аренду</b>\n\n` +
    `<b>Зал:</b> ${escapeHtml(hallName)}\n` +
    `<b>Дата:</b> ${escapeHtml(req.event_date)}, ${escapeHtml(req.time_from)}–${escapeHtml(req.time_to)}\n` +
    `<b>Формат:</b> ${escapeHtml(req.event_type)}\n` +
    `<b>Гостей:</b> ${req.guests}\n` +
    `<b>Оборудование:</b> ${req.equipment.length ? req.equipment.join(", ") : "—"}\n\n` +
    `<b>Контакт:</b> ${escapeHtml(req.name)}\n` +
    `📞 ${escapeHtml(req.phone)}\n` +
    `✉️ ${escapeHtml(req.email)}\n` +
    (req.message ? `\n<i>${escapeHtml(req.message)}</i>\n` : "");

  const ok = await sendTelegramMessage(text, "HTML");
  if (!ok) {
    console.warn("[rent] Telegram notification skipped (not configured or failed)");
  }
}
