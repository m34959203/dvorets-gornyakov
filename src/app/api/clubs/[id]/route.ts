import { NextRequest } from "next/server";
import { query, getOne } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { clubSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = await getOne(`SELECT * FROM clubs WHERE id = $1`, [id]);
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
    const parsed = parseBody(clubSchema, body);
    if ("error" in parsed) return apiError(parsed.error);
    const d = parsed.data;

    const result = await query(
      `UPDATE clubs SET name_kk=$1, name_ru=$2, description_kk=$3, description_ru=$4,
                         image_url=$5, age_group=$6, direction=$7, instructor_name=$8,
                         schedule=$9::jsonb, is_active=$10
        WHERE id=$11 RETURNING *`,
      [
        d.name_kk,
        d.name_ru,
        d.description_kk,
        d.description_ru,
        d.image_url || null,
        d.age_group || "all",
        d.direction || "general",
        d.instructor_name || "",
        JSON.stringify(d.schedule || []),
        d.is_active ?? true,
        id,
      ]
    );
    if (!result.rows[0]) return apiError("Not found", 404);
    return apiSuccess(result.rows[0]);
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}

const patchSchema = z.object({ is_active: z.boolean() });

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
      `UPDATE clubs SET is_active=$1 WHERE id=$2 RETURNING *`,
      [parsed.data.is_active, id]
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
    try {
      const result = await query(`DELETE FROM clubs WHERE id=$1 RETURNING id`, [id]);
      if (result.rowCount === 0) return apiError("Not found", 404);
      return apiSuccess({ ok: true });
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === "23503") {
        return apiError("Нельзя удалить: есть связанные записи. Отключите клуб.", 409);
      }
      throw e;
    }
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
