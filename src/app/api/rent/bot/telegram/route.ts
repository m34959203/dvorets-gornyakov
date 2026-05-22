import { NextRequest } from "next/server";
import { handleInbound } from "@/lib/rent/bot/handle";
import { tgSend, tgAnswerCallback } from "@/lib/rent/bot/channels";

export const dynamic = "force-dynamic";

interface TgUpdate {
  message?: { chat: { id: number }; text?: string };
  callback_query?: { id: string; data?: string; message?: { chat: { id: number } } };
}

export async function POST(req: NextRequest) {
  // Проверка секрета вебхука (Telegram шлёт его заголовком)
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new Response("forbidden", { status: 401 });
  }

  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return Response.json({ ok: true });
  }

  try {
    if (update.callback_query) {
      const cq = update.callback_query;
      await tgAnswerCallback(cq.id);
      const chatId = cq.message?.chat.id;
      if (chatId != null && cq.data) {
        const r = await handleInbound("telegram", String(chatId), cq.data);
        await tgSend(chatId, r.reply, r.options);
      }
    } else if (update.message?.text) {
      const chatId = update.message.chat.id;
      const r = await handleInbound("telegram", String(chatId), update.message.text);
      await tgSend(chatId, r.reply, r.options);
    }
  } catch (e) {
    console.error("[bot/telegram] error:", e);
  }

  // Всегда 200 — иначе Telegram будет ретраить апдейт.
  return Response.json({ ok: true });
}
