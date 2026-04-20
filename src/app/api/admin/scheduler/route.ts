import { NextRequest } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { apiError, apiSuccess, paginate } from "@/lib/utils";
import { scheduleJob } from "@/lib/scheduler";
import { z } from "zod";

const createSchema = z.object({
  type: z.enum(["publish_news", "publish_event"]),
  target_id: z.string().uuid(),
  run_at: z.string().datetime(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const { offset } = paginate(page, limit);

    const params: unknown[] = [];
    const where: string[] = [];
    if (status) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }
    if (type) {
      params.push(type);
      where.push(`type = $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const total = await query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM scheduled_jobs ${whereSql}`,
      params
    );
    params.push(limit, offset);
    const items = await query(
      `SELECT id, type, status, payload, run_at, started_at, completed_at, attempts, last_error, created_at
         FROM scheduled_jobs ${whereSql}
        ORDER BY run_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return apiSuccess({
      items: items.rows,
      total: parseInt(total.rows[0]?.c ?? "0", 10),
      page,
      limit,
    });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "invalid");

    const { type, target_id, run_at } = parsed.data;
    const payload = type === "publish_news" ? { news_id: target_id } : { event_id: target_id };
    const id = await scheduleJob({
      type,
      payload,
      runAt: new Date(run_at),
      createdBy: user!.userId,
    });
    return apiSuccess({ id }, 201);
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
