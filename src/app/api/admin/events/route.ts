import { NextRequest } from "next/server";
import { getMany, getOne } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const status = req.nextUrl.searchParams.get("status");
    const type = req.nextUrl.searchParams.get("type");
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, parseInt(req.nextUrl.searchParams.get("pageSize") || "50", 10));

    const conds: string[] = [];
    const params: unknown[] = [];
    if (status && /^(upcoming|ongoing|completed|cancelled)$/.test(status)) {
      params.push(status);
      conds.push(`status=$${params.length}`);
    }
    if (type && /^(concert|exhibition|workshop|festival|competition|other)$/.test(type)) {
      params.push(type);
      conds.push(`event_type=$${params.length}`);
    }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

    const total = await getOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM events ${where}`,
      params
    );
    params.push(pageSize);
    params.push((page - 1) * pageSize);
    const items = await getMany(
      `SELECT * FROM events ${where} ORDER BY start_date DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return apiSuccess({ items, total: total ? parseInt(total.count, 10) : 0, page, pageSize });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
