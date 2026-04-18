import { NextRequest } from "next/server";
import { query, getOne } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { bannerSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const { id } = await params;
    const row = await getOne(`SELECT * FROM banners WHERE id=$1`, [id]);
    if (!row) return apiError("Not found", 404);
    return apiSuccess(row);
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin"])) return apiError("Unauthorized", 401);
    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(bannerSchema, body);
    if ("error" in parsed) return apiError(parsed.error);
    const d = parsed.data;
    const result = await query(
      `UPDATE banners SET title=$1, image_url=$2, link_url=$3, position=$4, is_active=$5, sort_order=$6
        WHERE id=$7 RETURNING *`,
      [d.title, d.image_url, d.link_url || null, d.position || "hero", d.is_active ?? true, d.sort_order ?? 0, id]
    );
    if (!result.rows[0]) return apiError("Not found", 404);
    return apiSuccess(result.rows[0]);
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}

const patchSchema = z.object({
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin"])) return apiError("Unauthorized", 401);
    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(patchSchema, body);
    if ("error" in parsed) return apiError(parsed.error);
    const d = parsed.data;
    const sets: string[] = [];
    const values: unknown[] = [];
    if (d.is_active !== undefined) {
      values.push(d.is_active);
      sets.push(`is_active=$${values.length}`);
    }
    if (d.sort_order !== undefined) {
      values.push(d.sort_order);
      sets.push(`sort_order=$${values.length}`);
    }
    if (!sets.length) return apiError("Nothing to update");
    values.push(id);
    const result = await query(
      `UPDATE banners SET ${sets.join(", ")} WHERE id=$${values.length} RETURNING *`,
      values
    );
    if (!result.rows[0]) return apiError("Not found", 404);
    return apiSuccess(result.rows[0]);
  } catch (e) {
    console.error(e);
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
    const result = await query(`DELETE FROM banners WHERE id=$1 RETURNING id`, [id]);
    if (result.rowCount === 0) return apiError("Not found", 404);
    return apiSuccess({ ok: true });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
