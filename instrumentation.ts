export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  if (process.env.DISABLE_CRON !== "1") {
    const { startInProcessTicker } = await import("./src/lib/scheduler");
    startInProcessTicker();
  }

  // Возобновить WhatsApp-сессию, если она уже привязана (fire-and-forget)
  if (process.env.WA_DISABLED !== "1") {
    import("./src/lib/wa/runtime")
      .then((m) => m.resumeIfPaired())
      .catch((e) => console.error("[wa] resume error:", e));
  }
}
