import { NextRequest } from "next/server";
import { getOne, query } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { navItemSchema, parseBody } from "@/lib/validators";
import type { NavItemRow } from "@/lib/nav";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const { id } = await params;
    const item = await getOne<NavItemRow>(
      `SELECT id, slug, title_kk, title_ru, url, parent_id, sort_order,
              is_active, target, created_at
         FROM nav_items
        WHERE id = $1`,
      [id]
    );
    if (!item) return apiError("Not found", 404);
    return apiSuccess({ item });
  } catch (e) {
    console.error("GET /api/admin/navigation/[id] error:", e);
    return apiError("Internal server error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const { id } = await params;

    const body = await req.json();
    const parsed = parseBody(navItemSchema, body);
    if ("error" in parsed) return apiError(parsed.error);
    const d = parsed.data;

    // Prevent self-parenting
    if (d.parent_id && d.parent_id === id) {
      return apiError("parent_id cannot equal own id", 400);
    }

    const r = await query<NavItemRow>(
      `UPDATE nav_items
          SET slug=$1, title_kk=$2, title_ru=$3, url=$4,
              parent_id=$5, sort_order=$6, is_active=$7, target=$8
        WHERE id=$9
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
        id,
      ]
    );
    if (!r.rows[0]) return apiError("Not found", 404);
    return apiSuccess({ item: r.rows[0] });
  } catch (e) {
    console.error("PUT /api/admin/navigation/[id] error:", e);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin"])) return apiError("Unauthorized", 401);
    const { id } = await params;
    const r = await query(`DELETE FROM nav_items WHERE id = $1 RETURNING id`, [id]);
    if (r.rowCount === 0) return apiError("Not found", 404);
    return apiSuccess({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/navigation/[id] error:", e);
    return apiError("Internal server error", 500);
  }
}
