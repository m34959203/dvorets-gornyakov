import { query, getOne } from "@/lib/db";
import { publishNews, publishEvent } from "@/lib/publish";

const MAX_ATTEMPTS = 5;
const BATCH_SIZE = 10;

interface ScheduledJobRow {
  id: string;
  type: string;
  status: string;
  payload: Record<string, unknown>;
  run_at: Date;
  attempts: number;
}

function backoffMs(attempt: number): number {
  return 60_000 * Math.pow(4, attempt - 1);
}

async function claim(id: string): Promise<boolean> {
  const r = await query(
    `UPDATE scheduled_jobs
        SET status = 'running', started_at = NOW(), attempts = attempts + 1
      WHERE id = $1 AND status = 'pending'
      RETURNING id`,
    [id]
  );
  return r.rowCount === 1;
}

async function markDone(id: string) {
  await query(
    `UPDATE scheduled_jobs SET status = 'done', completed_at = NOW(), last_error = NULL WHERE id = $1`,
    [id]
  );
}

async function reschedule(id: string, attempts: number, err: string) {
  if (attempts >= MAX_ATTEMPTS) {
    await query(
      `UPDATE scheduled_jobs SET status = 'failed', completed_at = NOW(), last_error = $2 WHERE id = $1`,
      [id, err.slice(0, 1000)]
    );
    return;
  }
  const nextRun = new Date(Date.now() + backoffMs(attempts));
  await query(
    `UPDATE scheduled_jobs SET status = 'pending', run_at = $2, last_error = $3, started_at = NULL WHERE id = $1`,
    [id, nextRun, err.slice(0, 1000)]
  );
}

async function runOne(job: ScheduledJobRow): Promise<void> {
  if (job.type === "publish_news") {
    const newsId = job.payload.news_id as string;
    if (!newsId) throw new Error("news_id missing");
    const row = await getOne<{
      slug: string;
      title_ru: string;
      title_kk: string;
      excerpt_ru: string;
      excerpt_kk: string;
      image_url: string | null;
      status: string;
    }>(
      `SELECT slug, title_ru, title_kk, excerpt_ru, excerpt_kk, image_url, status
         FROM news WHERE id = $1`,
      [newsId]
    );
    if (!row) throw new Error(`news ${newsId} not found`);
    if (row.status !== "published") {
      await query(
        `UPDATE news SET status = 'published', published_at = COALESCE(published_at, NOW()) WHERE id = $1`,
        [newsId]
      );
    }
    await publishNews({
      slug: row.slug,
      title_ru: row.title_ru,
      title_kk: row.title_kk,
      excerpt_ru: row.excerpt_ru,
      excerpt_kk: row.excerpt_kk,
      image_url: row.image_url,
    });
    return;
  }

  if (job.type === "publish_event") {
    const eventId = job.payload.event_id as string;
    if (!eventId) throw new Error("event_id missing");
    const row = await getOne<{
      id: string;
      title_ru: string;
      title_kk: string;
      start_date: Date;
      location: string;
      event_type: string;
      image_url: string | null;
    }>(
      `SELECT id, title_ru, title_kk, start_date, location, event_type, image_url
         FROM events WHERE id = $1`,
      [eventId]
    );
    if (!row) throw new Error(`event ${eventId} not found`);
    await publishEvent({
      id: row.id,
      title_ru: row.title_ru,
      title_kk: row.title_kk,
      start_date: row.start_date,
      location: row.location,
      event_type: row.event_type,
      image_url: row.image_url,
    });
    return;
  }

  throw new Error(`unknown job type: ${job.type}`);
}

export async function runPendingJobs(): Promise<{ processed: number; failed: number }> {
  const res = await query<ScheduledJobRow>(
    `SELECT id, type, status, payload, run_at, attempts
       FROM scheduled_jobs
      WHERE status = 'pending' AND run_at <= NOW()
      ORDER BY run_at ASC
      LIMIT $1`,
    [BATCH_SIZE]
  );
  const jobs = res.rows;
  let processed = 0;
  let failed = 0;

  for (const job of jobs) {
    const claimed = await claim(job.id);
    if (!claimed) continue;
    try {
      await runOne(job);
      await markDone(job.id);
      processed += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[scheduler] job ${job.id} (${job.type}) failed: ${msg}`);
      await reschedule(job.id, job.attempts + 1, msg);
      failed += 1;
    }
  }
  return { processed, failed };
}

export async function scheduleJob(input: {
  type: "publish_news" | "publish_event";
  payload: Record<string, unknown>;
  runAt: Date;
  createdBy?: string;
}): Promise<string> {
  const r = await query<{ id: string }>(
    `INSERT INTO scheduled_jobs (type, payload, run_at, created_by)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [input.type, JSON.stringify(input.payload), input.runAt, input.createdBy ?? null]
  );
  return r.rows[0].id;
}

let tickerStarted = false;

export function startInProcessTicker() {
  if (tickerStarted) return;
  tickerStarted = true;
  const interval = 60_000;
  const tick = async () => {
    try {
      await runPendingJobs();
    } catch (e) {
      console.error("[scheduler] tick error:", e);
    }
  };
  setInterval(tick, interval).unref();
  setTimeout(tick, 5_000).unref();
}
