import { NextRequest } from "next/server";
import { getOne } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/utils";
import type { Hall } from "@/lib/rent/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const hall = await getOne<Hall>(
      `SELECT id, slug, name_kk, name_ru, description_kk, description_ru,
              capacity, equipment_kk, equipment_ru, hourly_price, event_price_from,
              photos, layout_url, is_active, sort_order, created_at, updated_at
         FROM halls
        WHERE slug = $1 AND is_active = TRUE`,
      [slug]
    );
    if (!hall) return apiError("Hall not found", 404);
    return apiSuccess({ hall });
  } catch (error) {
    console.error("GET /api/rent/halls/[slug] error:", error);
    return apiError("Internal server error", 500);
  }
}
