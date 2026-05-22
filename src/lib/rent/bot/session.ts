import { getOne, query } from "@/lib/db";
import type { BotState, BotStep, BotLocale, BotDraft } from "./engine";

export type BotChannel = "telegram" | "whatsapp";

interface SessionRow {
  step: string;
  data: BotDraft;
  locale: string;
}

export async function getSession(channel: BotChannel, chatId: string): Promise<BotState | null> {
  try {
    const row = await getOne<SessionRow>(
      `SELECT step, data, locale FROM bot_sessions WHERE channel = $1 AND chat_id = $2`,
      [channel, chatId]
    );
    if (!row) return null;
    return { step: row.step as BotStep, data: row.data ?? {}, locale: (row.locale as BotLocale) ?? "ru" };
  } catch (e) {
    console.error("[bot] getSession error:", e);
    return null;
  }
}

export async function saveSession(channel: BotChannel, chatId: string, state: BotState): Promise<void> {
  try {
    await query(
      `INSERT INTO bot_sessions (channel, chat_id, step, data, locale, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5, NOW())
       ON CONFLICT (channel, chat_id)
       DO UPDATE SET step = EXCLUDED.step, data = EXCLUDED.data, locale = EXCLUDED.locale, updated_at = NOW()`,
      [channel, chatId, state.step, JSON.stringify(state.data), state.locale]
    );
  } catch (e) {
    console.error("[bot] saveSession error:", e);
  }
}

export async function resetSession(channel: BotChannel, chatId: string): Promise<void> {
  try {
    await query(`DELETE FROM bot_sessions WHERE channel = $1 AND chat_id = $2`, [channel, chatId]);
  } catch (e) {
    console.error("[bot] resetSession error:", e);
  }
}
