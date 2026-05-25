import { NextRequest } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";

const patchSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "completed", "cancelled"]).optional(),
  notes_admin: z.string().max(2000).optional(),
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

    const result = await query(
      `UPDATE bookings
          SET status = COALESCE($1, status),
              notes_admin = COALESCE($2, notes_admin),
              updated_at = NOW()
        WHERE id = $3
        RETURNING *`,
      [parsed.data.status ?? null, parsed.data.notes_admin ?? null, id]
    );
    if (!result.rows[0]) return apiError("Not found", 404);
    return apiSuccess({ booking: result.rows[0] });
  } catch (error) {
    console.error("PATCH /api/admin/bookings/[id] error:", error);
    return apiError("Internal server error", 500);
  }
}
