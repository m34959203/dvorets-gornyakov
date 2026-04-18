import { NextRequest } from "next/server";
import { getMany, getOne } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import type { RentalRequestWithHall } from "@/lib/rent/types";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }

    const status = req.nextUrl.searchParams.get("status");
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("pageSize") || "20", 10)));

    const conds: string[] = [];
    const params: unknown[] = [];
    if (status) {
      if (!/^(new|contacted|confirmed|rejected|completed)$/.test(status)) {
        return apiError("Invalid status");
      }
      params.push(status);
      conds.push(`r.status = $${params.length}`);
    }
    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
      params.push(from);
      conds.push(`r.event_date >= $${params.length}::date`);
    }
    if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
      params.push(to);
      conds.push(`r.event_date <= $${params.length}::date`);
    }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

    const total = await getOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM rental_requests r ${where}`,
      params
    );

    params.push(pageSize);
    const limitIdx = params.length;
    params.push((page - 1) * pageSize);
    const offsetIdx = params.length;

    const rows = await getMany<RentalRequestWithHall>(
      `SELECT r.*, h.name_ru AS hall_name_ru, h.name_kk AS hall_name_kk, h.slug AS hall_slug
         FROM rental_requests r
         JOIN halls h ON h.id = r.hall_id
         ${where}
        ORDER BY r.created_at DESC
        LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );

    return apiSuccess({
      requests: rows,
      total: total ? parseInt(total.count, 10) : 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("GET /api/admin/rent/requests error:", error);
    return apiError("Internal server error", 500);
  }
}
