import { getMany } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/utils";
import type { Hall } from "@/lib/rent/types";

export async function GET() {
  try {
    const rows = await getMany<Hall>(
      `SELECT id, slug, name_kk, name_ru, description_kk, description_ru,
              capacity, equipment_kk, equipment_ru, hourly_price, event_price_from,
              photos, layout_url, is_active, sort_order, created_at, updated_at
         FROM halls
        WHERE is_active = TRUE
        ORDER BY sort_order ASC, name_ru ASC`
    );
    return apiSuccess({ halls: rows });
  } catch (error) {
    console.error("GET /api/rent/halls error:", error);
    return apiError("Internal server error", 500);
  }
}
