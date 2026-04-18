import { NextRequest } from "next/server";
import { query, getOne } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { rentalRequestStatusSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";
import type { RentalRequest } from "@/lib/rent/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }
    const { id } = await params;
    const row = await getOne<RentalRequest & { hall_name_ru: string; hall_name_kk: string; hall_slug: string }>(
      `SELECT r.*, h.name_ru AS hall_name_ru, h.name_kk AS hall_name_kk, h.slug AS hall_slug
         FROM rental_requests r JOIN halls h ON h.id = r.hall_id WHERE r.id = $1`,
      [id]
    );
    if (!row) return apiError("Not found", 404);
    return apiSuccess({ request: row });
  } catch (error) {
    console.error("GET /api/admin/rent/requests/[id] error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }
    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(rentalRequestStatusSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    try {
      const result = await query<RentalRequest>(
        `UPDATE rental_requests
            SET status = $1,
                admin_note = COALESCE($2, admin_note),
                updated_at = NOW()
          WHERE id = $3
          RETURNING *`,
        [parsed.data.status, parsed.data.admin_note ?? null, id]
      );
      if (!result.rows[0]) return apiError("Not found", 404);
      return apiSuccess({ request: result.rows[0] });
    } catch (e: unknown) {
      const err = e as { code?: string; constraint?: string };
      if (err.code === "23505" && err.constraint === "uniq_confirmed_booking") {
        return apiError(
          "На эту дату/время уже есть подтверждённое бронирование",
          409
        );
      }
      throw e;
    }
  } catch (error) {
    console.error("PATCH /api/admin/rent/requests/[id] error:", error);
    return apiError("Internal server error", 500);
  }
}
