import { NextRequest } from "next/server";
import { getMany, query } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { navItemSchema, parseBody } from "@/lib/validators";
import type { NavItemRow } from "@/lib/nav";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);

    const items = await getMany<NavItemRow>(
      `SELECT id, slug, title_kk, title_ru, url, parent_id, sort_order,
              is_active, target, created_at
         FROM nav_items
        ORDER BY (parent_id IS NOT NULL), parent_id NULLS FIRST, sort_order ASC, created_at ASC`
    );
    return apiSuccess({ items });
  } catch (e) {
    console.error("GET /api/admin/navigation error:", e);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = parseBody(navItemSchema, body);
    if ("error" in parsed) return apiError(parsed.error);
    const d = parsed.data;

    const r = await query<NavItemRow>(
      `INSERT INTO nav_items
         (slug, title_kk, title_ru, url, parent_id, sort_order, is_active, target)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, slug, title_kk, title_ru, url, parent_id, sort_order,
                 is_active, target, created_at`,
      [
        d.slug,
        d.title_kk,
        d.title_ru,
        d.url,
        d.parent_id ?? null,
        d.sort_order ?? 0,
        d.is_active ?? true,
        d.target,
      ]
    );
    return apiSuccess({ item: r.rows[0] }, 201);
  } catch (e) {
    console.error("POST /api/admin/navigation error:", e);
    return apiError("Internal server error", 500);
  }
}
