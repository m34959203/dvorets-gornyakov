import { NextRequest } from "next/server";
import { query, getMany } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { bannerSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  try {
    const banners = await getMany(
      "SELECT * FROM banners WHERE is_active = true ORDER BY sort_order ASC"
    );
    return apiSuccess(banners);
  } catch (error) {
    console.error("Banners GET error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin"])) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = parseBody(bannerSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const data = parsed.data;

    const result = await query(
      `INSERT INTO banners (title, image_url, link_url, position, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.title, data.image_url, data.link_url || null, data.position || "hero", data.is_active ?? true, data.sort_order ?? 0]
    );

    return apiSuccess(result.rows[0], 201);
  } catch (error) {
    console.error("Banners POST error:", error);
    return apiError("Internal server error", 500);
  }
}
