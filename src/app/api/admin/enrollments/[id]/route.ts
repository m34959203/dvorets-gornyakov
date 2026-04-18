import { NextRequest } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { parseBody } from "@/lib/validators";

const patchSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(patchSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const r = await query(
      `UPDATE enrollments SET status=$1 WHERE id=$2 RETURNING *`,
      [parsed.data.status, id]
    );
    if (!r.rows[0]) return apiError("Not found", 404);
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
    const r = await query(`DELETE FROM enrollments WHERE id=$1 RETURNING id`, [id]);
    if (r.rowCount === 0) return apiError("Not found", 404);
    return apiSuccess({ ok: true });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
