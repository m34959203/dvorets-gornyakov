import { NextRequest } from "next/server";
import { query, getMany } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { clubSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const direction = searchParams.get("direction");
    const activeOnly = searchParams.get("active") !== "false";

    let sql = "SELECT * FROM clubs WHERE 1=1";
    const params: unknown[] = [];

    if (activeOnly) {
      params.push(true);
      sql += ` AND is_active = $${params.length}`;
    }

    if (direction && direction !== "all") {
      params.push(direction);
      sql += ` AND direction = $${params.length}`;
    }

    sql += " ORDER BY name_kk ASC";

    const clubs = await getMany(sql, params);
    return apiSuccess(clubs);
  } catch (error) {
    console.error("Clubs GET error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = parseBody(clubSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const data = parsed.data;

    const result = await query(
      `INSERT INTO clubs (name_kk, name_ru, description_kk, description_ru, image_url, age_group, direction, instructor_name, schedule, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.name_kk,
        data.name_ru,
        data.description_kk,
        data.description_ru,
        data.image_url || null,
        data.age_group || "all",
        data.direction || "general",
        data.instructor_name || "",
        JSON.stringify(data.schedule || []),
        data.is_active ?? true,
      ]
    );

    return apiSuccess(result.rows[0], 201);
  } catch (error) {
    console.error("Clubs POST error:", error);
    return apiError("Internal server error", 500);
  }
}
