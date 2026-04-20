import { NextRequest } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { query, getOne } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  body_kk: z.string().optional(),
  body_ru: z.string().optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "invalid");
    const d = parsed.data;

    const existing = await getOne<{ platform: string; kind: string }>(
      `SELECT platform, kind FROM social_templates WHERE id = $1`,
      [id]
    );
    if (!existing) return apiError("Not found", 404);

    if (d.is_default === true) {
      await query(
        `UPDATE social_templates SET is_default = FALSE WHERE platform = $1 AND kind = $2 AND id <> $3`,
        [existing.platform, existing.kind, id]
      );
    }

    const sets: string[] = [];
    const params2: unknown[] = [];
    for (const [k, v] of Object.entries(d)) {
      params2.push(v);
      sets.push(`${k} = $${params2.length}`);
    }
    if (sets.length === 0) return apiError("No fields to update");
    params2.push(id);
    const r = await query(
      `UPDATE social_templates SET ${sets.join(", ")} WHERE id = $${params2.length} RETURNING *`,
      params2
    );
    return apiSuccess(r.rows[0]);
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
    const r = await query(`DELETE FROM social_templates WHERE id = $1 RETURNING id`, [id]);
    if (r.rowCount === 0) return apiError("Not found", 404);
    return apiSuccess({ ok: true });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
