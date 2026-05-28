import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  type WASocket,
  type WAMessage,
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import { useDbAuthState, clearAuthState } from "./authState";
import { handleInbound } from "@/lib/rent/bot/handle";
import { query } from "@/lib/db";

export type WAStatus = "disconnected" | "connecting" | "qr" | "connected";

interface WARuntime {
  status: WAStatus;
  qr?: string; // data-URL PNG
  me?: string; // подключённый номер
  lastError?: string;
  sock?: WASocket;
  starting: boolean;
  manualStop: boolean;
}

// Синглтон на процесс (переживает HMR / повторные импорты модуля).
const g = globalThis as unknown as { __waRuntime?: WARuntime };
function rt(): WARuntime {
  if (!g.__waRuntime) {
    g.__waRuntime = { status: "disconnected", starting: false, manualStop: false };
  }
  return g.__waRuntime;
}

function jidToPhone(jid?: string): string | undefined {
  if (!jid) return undefined;
  return jid.split(":")[0].split("@")[0];
}

function extractText(msg: WAMessage): string {
  const m = msg.message;
  if (!m) return "";
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.buttonsResponseMessage?.selectedDisplayText ||
    m.listResponseMessage?.title ||
    ""
  );
}

async function onMessage(sock: WASocket, msg: WAMessage) {
  if (!msg.message || msg.key.fromMe) return;
  const jid = msg.key.remoteJid || "";
  if (!jid || jid.endsWith("@g.us") || jid === "status@broadcast") return;

  const text = extractText(msg).trim();
  if (!text) return;

  try {
    const phone = jidToPhone(jid) || jid;
    const r = await handleInbound("whatsapp", phone, text);
    let reply = r.reply;
    if (r.options && r.options.length) {
      reply += "\n\n" + r.options.map((o, i) => `${i + 1}. ${o.label}`).join("\n");
    }
    await sock.sendMessage(jid, { text: reply });
  } catch (e) {
    console.error("[wa] onMessage error:", e);
  }
}

/** Запускает сокет (fire-and-forget). Повторные вызовы безопасны. */
export async function connect(): Promise<void> {
  const r = rt();
  if (r.starting || r.status === "connected" || r.status === "connecting" || r.status === "qr") return;
  r.starting = true;
  r.manualStop = false;
  r.status = "connecting";
  r.lastError = undefined;

  try {
    // useDbAuthState — функция Baileys (auth state), а не React-хук; правило ложно срабатывает на "use"-префикс.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { state, saveCreds } = await useDbAuthState();

    // Версия WA: пробуем актуальную, иначе фолбэк (см. инцидент Baileys 405).
    let version: [number, number, number] | undefined;
    try {
      const fetched = await fetchLatestBaileysVersion();
      version = fetched.version;
    } catch {
      version = undefined; // Baileys возьмёт встроенную
    }

    const sock = makeWASocket({
      auth: state,
      version,
      printQRInTerminal: false,
      browser: ["Дворец горняков", "Chrome", "1.0.0"],
      syncFullHistory: false,
    });
    r.sock = sock;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (u) => {
      const { connection, lastDisconnect, qr } = u;
      if (qr) {
        try {
          r.qr = await QRCode.toDataURL(qr);
          r.status = "qr";
        } catch {
          /* ignore */
        }
      }
      if (connection === "open") {
        r.status = "connected";
        r.qr = undefined;
        r.starting = false;
        r.me = jidToPhone(sock.user?.id);
        // Автозаполнить номер для wa.me-диплинка, если ещё не задан
        if (r.me) {
          query(
            `INSERT INTO site_settings (key, value) VALUES ('whatsapp_phone', $1)
             ON CONFLICT (key) DO UPDATE SET value = CASE
               WHEN site_settings.value IS NULL OR site_settings.value = '' THEN EXCLUDED.value
               ELSE site_settings.value END`,
            [r.me]
          ).catch(() => {});
        }
      }
      if (connection === "close") {
        r.starting = false;
        const code = (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)?.output
          ?.statusCode;
        r.lastError = lastDisconnect?.error?.message;
        const loggedOut = code === DisconnectReason.loggedOut;
        if (loggedOut) {
          await clearAuthState().catch(() => {});
          r.status = "disconnected";
          r.qr = undefined;
          r.me = undefined;
          r.sock = undefined;
        } else if (!r.manualStop) {
          r.status = "connecting";
          setTimeout(() => {
            r.starting = false;
            connect().catch(() => {});
          }, 2500);
        } else {
          r.status = "disconnected";
          r.sock = undefined;
        }
      }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;
      for (const msg of messages) await onMessage(sock, msg);
    });
  } catch (e) {
    r.starting = false;
    r.status = "disconnected";
    r.lastError = e instanceof Error ? e.message : String(e);
    console.error("[wa] connect error:", e);
  }
}

/** Останавливает сокет без разлогина (сессия в БД сохраняется). */
export async function disconnect(): Promise<void> {
  const r = rt();
  r.manualStop = true;
  try {
    r.sock?.end(undefined);
  } catch {
    /* ignore */
  }
  r.sock = undefined;
  r.status = "disconnected";
  r.qr = undefined;
}

/** Полный разлогин: рвёт сессию и чистит креды (нужен новый QR). */
export async function logout(): Promise<void> {
  const r = rt();
  r.manualStop = true;
  try {
    await r.sock?.logout();
  } catch {
    /* ignore */
  }
  await clearAuthState().catch(() => {});
  r.sock = undefined;
  r.status = "disconnected";
  r.qr = undefined;
  r.me = undefined;
}

export function getStatus(): { status: WAStatus; qr?: string; me?: string; lastError?: string } {
  const r = rt();
  return { status: r.status, qr: r.qr, me: r.me, lastError: r.lastError };
}

/** Автовозобновление при старте процесса, если в БД есть сохранённая сессия. */
export async function resumeIfPaired(): Promise<void> {
  try {
    const { getOne } = await import("@/lib/db");
    const row = await getOne<{ id: string }>(`SELECT id FROM wa_auth WHERE id = 'creds' LIMIT 1`);
    if (row) await connect();
  } catch {
    /* ignore */
  }
}
