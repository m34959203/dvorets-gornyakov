import { NextRequest } from "next/server";
import { getMany, getOne } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

interface EnrollmentRow {
  id: string;
  club_id: string;
  child_name: string;
  child_age: number;
  parent_name: string;
  phone: string;
  email: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  club_name_ru: string;
  club_name_kk: string;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);

    const status = req.nextUrl.searchParams.get("status");
    const clubId = req.nextUrl.searchParams.get("club_id");
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, parseInt(req.nextUrl.searchParams.get("pageSize") || "30", 10));

    const conds: string[] = [];
    const params: unknown[] = [];
    if (status && /^(pending|approved|rejected)$/.test(status)) {
      params.push(status);
      conds.push(`e.status=$${params.length}`);
    }
    if (clubId && /^[0-9a-f-]{36}$/i.test(clubId)) {
      params.push(clubId);
      conds.push(`e.club_id=$${params.length}`);
    }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

    const total = await getOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM enrollments e ${where}`,
      params
    );
    params.push(pageSize);
    params.push((page - 1) * pageSize);
    const items = await getMany<EnrollmentRow>(
      `SELECT e.*, c.name_ru AS club_name_ru, c.name_kk AS club_name_kk
         FROM enrollments e JOIN clubs c ON c.id = e.club_id
         ${where}
        ORDER BY e.created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return apiSuccess({ items, total: total ? parseInt(total.count, 10) : 0, page, pageSize });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
