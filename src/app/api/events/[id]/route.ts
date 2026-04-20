import { NextRequest } from "next/server";
import { query, getOne } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { eventSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";
import { publishEvent } from "@/lib/publish";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = await getOne(`SELECT * FROM events WHERE id = $1`, [id]);
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
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(eventSchema, body);
    if ("error" in parsed) return apiError(parsed.error);
    const d = parsed.data;

    const existing = await getOne<{ status: string; start_date: Date }>(
      `SELECT status, start_date FROM events WHERE id = $1`,
      [id]
    );
    if (!existing) return apiError("Not found", 404);

    const newStatus = d.status || "upcoming";

    const result = await query(
      `UPDATE events SET title_kk=$1, title_ru=$2, description_kk=$3, description_ru=$4,
                          image_url=$5, event_type=$6, start_date=$7, end_date=$8,
                          location=$9, status=$10
        WHERE id=$11 RETURNING *`,
      [
        d.title_kk,
        d.title_ru,
        d.description_kk,
        d.description_ru,
        d.image_url || null,
        d.event_type || "other",
        d.start_date,
        d.end_date || null,
        d.location || "",
        newStatus,
        id,
      ]
    );
    if (!result.rows[0]) return apiError("Not found", 404);
    const row = result.rows[0];
    const prevStart = existing.start_date
      ? new Date(existing.start_date).getTime()
      : NaN;
    const newStart = new Date(row.start_date).getTime();
    const statusTransitioned =
      newStatus === "upcoming" && existing.status !== "upcoming";
    const dateChangedAndUpcoming =
      newStatus === "upcoming" &&
      !isNaN(newStart) &&
      !isNaN(prevStart) &&
      newStart !== prevStart &&
      newStart > Date.now();
    if (statusTransitioned || dateChangedAndUpcoming) {
      publishEvent({
        id: row.id,
        title_ru: row.title_ru,
        title_kk: row.title_kk,
        start_date: row.start_date,
        location: row.location,
        event_type: row.event_type,
        image_url: row.image_url,
      }).catch(console.error);
    }
    return apiSuccess(row);
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}

const patchSchema = z.object({
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]),
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

    const existing = await getOne<{ status: string }>(
      `SELECT status FROM events WHERE id = $1`,
      [id]
    );
    if (!existing) return apiError("Not found", 404);

    const result = await query(
      `UPDATE events SET status=$1 WHERE id=$2 RETURNING *`,
      [parsed.data.status, id]
    );
    if (!result.rows[0]) return apiError("Not found", 404);
    const row = result.rows[0];
    if (parsed.data.status === "upcoming" && existing.status !== "upcoming") {
      publishEvent({
        id: row.id,
        title_ru: row.title_ru,
        title_kk: row.title_kk,
        start_date: row.start_date,
        location: row.location,
        event_type: row.event_type,
        image_url: row.image_url,
      }).catch(console.error);
    }
    return apiSuccess(row);
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
    const result = await query(`DELETE FROM events WHERE id=$1 RETURNING id`, [id]);
    if (result.rowCount === 0) return apiError("Not found", 404);
    return apiSuccess({ ok: true });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
