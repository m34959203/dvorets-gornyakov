import { NextRequest } from "next/server";
import { getMany, getOne } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { getSummary } from "@/lib/ai-usage";

interface GenerationRow {
  id: string;
  provider: string;
  model: string;
  purpose: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  cost_usd: string;
  duration_ms: number | null;
  success: boolean;
  error: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }

    const url = new URL(request.url);
    const purpose = url.searchParams.get("purpose") || undefined;
    const status = url.searchParams.get("status") || undefined; // success|error
    const from = url.searchParams.get("from") || undefined;
    const to = url.searchParams.get("to") || undefined;

    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limitRaw = Number(url.searchParams.get("limit") || 50);
    const limit = Math.min(200, Math.max(1, limitRaw));
    const offset = (page - 1) * limit;

    const where: string[] = [];
    const params: unknown[] = [];

    if (purpose) {
      params.push(purpose);
      where.push(`g.purpose = $${params.length}`);
    }
    if (status === "success") {
      where.push(`g.success = TRUE`);
    } else if (status === "error") {
      where.push(`g.success = FALSE`);
    }
    if (from) {
      params.push(from);
      where.push(`g.created_at >= $${params.length}`);
    }
    if (to) {
      params.push(to);
      where.push(`g.created_at <= $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Total count for pagination
    const totalRow = await getOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM ai_generations g ${whereSql}`,
      params
    );
    const total = Number(totalRow?.count ?? 0);

    // Items page
    const listParams = [...params, limit, offset];
    const items = await getMany<GenerationRow>(
      `SELECT g.id, g.provider, g.model, g.purpose, g.user_id,
              u.name AS user_name, u.email AS user_email,
              g.prompt_tokens, g.completion_tokens, g.total_tokens,
              g.cost_usd::text AS cost_usd, g.duration_ms, g.success,
              g.error, g.created_at
         FROM ai_generations g
         LEFT JOIN users u ON u.id = g.user_id
         ${whereSql}
         ORDER BY g.created_at DESC
         LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    const summary = await getSummary({ purpose, from, to });

    return apiSuccess({
      items: items.map((i) => ({
        ...i,
        cost_usd: Number(i.cost_usd),
      })),
      total,
      page,
      limit,
      summary,
    });
  } catch (error) {
    console.error("GET /api/admin/ai-usage error:", error);
    return apiError("Internal server error", 500);
  }
}
