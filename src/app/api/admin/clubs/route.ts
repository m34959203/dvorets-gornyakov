import { NextRequest } from "next/server";
import { getMany } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const direction = req.nextUrl.searchParams.get("direction");
    const active = req.nextUrl.searchParams.get("active"); // "true"|"false"|null

    const conds: string[] = [];
    const params: unknown[] = [];
    if (direction && direction !== "all") {
      params.push(direction);
      conds.push(`direction=$${params.length}`);
    }
    if (active === "true" || active === "false") {
      params.push(active === "true");
      conds.push(`is_active=$${params.length}`);
    }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const items = await getMany(
      `SELECT * FROM clubs ${where} ORDER BY name_ru ASC`,
      params
    );
    return apiSuccess({ items });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
