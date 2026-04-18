import { NextRequest } from "next/server";
import { query, getOne } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { hallSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";
import type { Hall } from "@/lib/rent/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const { id } = await params;
    const hall = await getOne<Hall>(`SELECT * FROM halls WHERE id = $1`, [id]);
    if (!hall) return apiError("Not found", 404);
    return apiSuccess({ hall });
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
    const parsed = parseBody(hallSchema, body);
    if ("error" in parsed) return apiError(parsed.error);
    const d = parsed.data;

    const result = await query<Hall>(
      `UPDATE halls
          SET slug=$1, name_kk=$2, name_ru=$3, description_kk=$4, description_ru=$5,
              capacity=$6, equipment_kk=$7::jsonb, equipment_ru=$8::jsonb,
              hourly_price=$9, event_price_from=$10, photos=$11::jsonb,
              layout_url=$12, is_active=$13, sort_order=$14, updated_at=NOW()
        WHERE id=$15
        RETURNING *`,
      [
        d.slug,
        d.name_kk,
        d.name_ru,
        d.description_kk,
        d.description_ru,
        d.capacity,
        JSON.stringify(d.equipment_kk),
        JSON.stringify(d.equipment_ru),
        d.hourly_price,
        d.event_price_from,
        JSON.stringify(d.photos),
        d.layout_url ?? null,
        d.is_active ?? true,
        d.sort_order ?? 0,
        id,
      ]
    );
    if (!result.rows[0]) return apiError("Not found", 404);
    return apiSuccess({ hall: result.rows[0] });
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
    const result = await query(`DELETE FROM halls WHERE id = $1 RETURNING id`, [id]);
    if (result.rowCount === 0) return apiError("Not found", 404);
    return apiSuccess({ ok: true });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "23503") {
      return apiError(
        "Невозможно удалить зал — есть связанные заявки. Отметьте as inactive.",
        409
      );
    }
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
