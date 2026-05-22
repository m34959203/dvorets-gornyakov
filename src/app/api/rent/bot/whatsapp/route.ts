import { NextRequest } from "next/server";
import { handleInbound } from "@/lib/rent/bot/handle";
import { waSend } from "@/lib/rent/bot/channels";

export const dynamic = "force-dynamic";

/**
 * Вебхук для входящих WhatsApp-сообщений от Baileys-гейта.
 * Ожидаемый контракт гейта: POST { from: string, text: string }
 * (+ секрет в ?secret= или заголовке x-wa-secret).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.WA_WEBHOOK_SECRET;
  if (secret) {
    const provided = req.nextUrl.searchParams.get("secret") || req.headers.get("x-wa-secret");
    if (provided !== secret) return new Response("forbidden", { status: 401 });
  }

  let body: { from?: string; text?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: true });
  }

  const from = body.from?.trim();
  const text = (body.text ?? body.message ?? "").toString();
  if (!from) return Response.json({ ok: true });

  try {
    const r = await handleInbound("whatsapp", from, text);
    await waSend(from, r.reply, r.options);
  } catch (e) {
    console.error("[bot/whatsapp] error:", e);
  }

  return Response.json({ ok: true });
}
