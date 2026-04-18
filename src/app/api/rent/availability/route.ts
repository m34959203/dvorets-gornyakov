import { NextRequest } from "next/server";
import { getMany } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const hallId = req.nextUrl.searchParams.get("hall_id");
    const month = req.nextUrl.searchParams.get("month"); // YYYY-MM, optional

    if (hallId && !/^[0-9a-f-]{36}$/i.test(hallId)) {
      return apiError("Invalid hall_id");
    }
    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      return apiError("Invalid month (expected YYYY-MM)");
    }

    const conds: string[] = [];
    const params: unknown[] = [];
    if (hallId) {
      params.push(hallId);
      conds.push(`hall_id = $${params.length}`);
    }
    if (month) {
      params.push(`${month}-01`);
      conds.push(`day >= $${params.length}::date`);
      params.push(`${month}-01`);
      conds.push(`day < ($${params.length}::date + INTERVAL '1 month')`);
    } else {
      conds.push(`day >= CURRENT_DATE`);
      conds.push(`day < CURRENT_DATE + INTERVAL '6 months'`);
    }

    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const rows = await getMany<{ hall_id: string; day: string; source: string }>(
      `SELECT DISTINCT hall_id, day::text, source FROM hall_busy_days ${where} ORDER BY day ASC`,
      params
    );

    return apiSuccess({ busy: rows });
  } catch (error) {
    console.error("GET /api/rent/availability error:", error);
    return apiError("Internal server error", 500);
  }
}
