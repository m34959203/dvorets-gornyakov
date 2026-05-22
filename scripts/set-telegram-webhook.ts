/**
 * Регистрирует Telegram-вебхук бота бронирования и печатает @username бота.
 *
 *   npx tsx scripts/set-telegram-webhook.ts https://<домен-или-туннель>
 *
 * Требует env: TELEGRAM_BOT_TOKEN, (опц.) TELEGRAM_WEBHOOK_SECRET.
 * URL можно не передавать — возьмётся из NEXT_PUBLIC_APP_URL.
 */
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("✖ TELEGRAM_BOT_TOKEN не задан");
  process.exit(1);
}

const base = (process.argv[2] || process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
if (!base.startsWith("https://")) {
  console.error("✖ Укажите публичный https-URL: npx tsx scripts/set-telegram-webhook.ts https://example.kz");
  process.exit(1);
}

const secret = process.env.TELEGRAM_WEBHOOK_SECRET || "";
const webhookUrl = `${base}/api/rent/bot/telegram`;
const api = `https://api.telegram.org/bot${token}`;

async function main() {
  const me = await (await fetch(`${api}/getMe`)).json();
  if (me.ok) {
    console.log(`🤖 Бот: @${me.result.username}  (TELEGRAM_BOT_USERNAME=${me.result.username})`);
  } else {
    console.error("✖ getMe:", me.description);
    process.exit(1);
  }

  const body: Record<string, unknown> = {
    url: webhookUrl,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  };
  if (secret) body.secret_token = secret;

  const res = await (
    await fetch(`${api}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  ).json();

  if (res.ok) {
    console.log(`✅ Вебхук установлен: ${webhookUrl}${secret ? " (с секретом)" : ""}`);
  } else {
    console.error("✖ setWebhook:", res.description);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
