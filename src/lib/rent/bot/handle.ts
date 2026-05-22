import { getMany, getOne } from "@/lib/db";
import { createRentalRequest } from "@/lib/rent/create";
import { advance, greeting, type BotState, type EngineCtx, type HallLite, type BotOption } from "./engine";
import { getSession, saveSession, resetSession, type BotChannel } from "./session";

export interface InboundResult {
  reply: string;
  options?: BotOption[];
}

async function loadHalls(): Promise<HallLite[]> {
  try {
    return await getMany<HallLite>(
      `SELECT id, name_ru, name_kk FROM halls WHERE is_active = TRUE ORDER BY sort_order ASC, name_ru ASC`
    );
  } catch {
    return [];
  }
}

function isStart(text: string): { payload?: string } | null {
  const m = text.trim().match(/^\/start(?:\s+(\S+))?/i);
  if (m) return { payload: m[1] };
  if (/^(start|старт|бастау)$/i.test(text.trim())) return {};
  return null;
}

function isCancel(text: string): boolean {
  return /^\/?(cancel|stop|отмена|тоқтату|болдырмау)$/i.test(text.trim());
}

/**
 * Обрабатывает входящее сообщение из любого канала: ведёт диалог,
 * на финале создаёт заявку. Возвращает ответ для отправки пользователю.
 */
export async function handleInbound(
  channel: BotChannel,
  chatId: string,
  text: string
): Promise<InboundResult> {
  const halls = await loadHalls();
  const ctx: EngineCtx = { halls };

  // /start (+ deep-link payload rent_<slug>)
  const start = isStart(text);
  if (start) {
    let data: BotState["data"] = {};
    const slug = start.payload?.replace(/^rent[_-]?/i, "");
    if (slug) {
      const hall = await getOne<{ id: string; name_ru: string; name_kk: string }>(
        `SELECT id, name_ru, name_kk FROM halls WHERE slug = $1 AND is_active = TRUE`,
        [slug]
      );
      if (hall) data = { hall_id: hall.id, hall_name: hall.name_ru };
    }
    const g = greeting("kk");
    const state: BotState = { step: "lang", data, locale: "kk" };
    await saveSession(channel, chatId, state);
    return { reply: g.reply, options: g.options };
  }

  if (isCancel(text)) {
    await resetSession(channel, chatId);
    return { reply: "Отменено. /start — начать заново.\nТоқтатылды. /start — қайта бастау." };
  }

  // Нет сессии — приветствуем
  let state = await getSession(channel, chatId);
  if (!state) {
    const g = greeting("kk");
    await saveSession(channel, chatId, { step: "lang", data: {}, locale: "kk" });
    return { reply: g.reply, options: g.options };
  }

  const result = advance(state, text, ctx);
  state = result.state;

  if (result.completed) {
    const c = result.completed;
    const res = await createRentalRequest({
      hall_id: c.hall_id,
      name: c.name,
      phone: c.phone,
      email: c.email || "noemail@dvorets.local",
      event_type: c.event_type,
      event_date: c.event_date,
      time_from: c.time_from,
      time_to: c.time_to,
      guests: c.guests,
      equipment: [],
      message: "",
      source: channel,
    });
    await resetSession(channel, chatId);
    if (!res.ok) {
      return {
        reply:
          state.locale === "kk"
            ? "Кешіріңіз, өтінімді сақтау кезінде қате шықты. Кейінірек қайталаңыз немесе кассаға қоңырау шалыңыз: +7 (71063) 6-24-40."
            : "Извините, не удалось сохранить заявку. Попробуйте позже или позвоните в кассу: +7 (71063) 6-24-40.",
      };
    }
    return { reply: result.reply };
  }

  await saveSession(channel, chatId, state);
  return { reply: result.reply, options: result.options };
}
