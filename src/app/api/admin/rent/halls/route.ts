import { NextRequest } from "next/server";
import { query, getMany } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { hallSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";
import type { Hall } from "@/lib/rent/types";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }
    const rows = await getMany<Hall>(
      `SELECT * FROM halls ORDER BY sort_order ASC, name_ru ASC`
    );
    return apiSuccess({ halls: rows });
  } catch (error) {
    console.error("GET /api/admin/rent/halls error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin"])) return apiError("Unauthorized", 401);

    const body = await request.json();
    const parsed = parseBody(hallSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const d = parsed.data;
    const result = await query<Hall>(
      `INSERT INTO halls (slug, name_kk, name_ru, description_kk, description_ru,
                          capacity, equipment_kk, equipment_ru, hourly_price, event_price_from,
                          photos, layout_url, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10,$11::jsonb,$12,$13,$14)
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
      ]
    );
    return apiSuccess({ hall: result.rows[0] }, 201);
  } catch (error) {
    console.error("POST /api/admin/rent/halls error:", error);
    return apiError("Internal server error", 500);
  }
}
