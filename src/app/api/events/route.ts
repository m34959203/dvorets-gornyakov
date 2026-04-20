import { NextRequest } from "next/server";
import { query, getMany } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { eventSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";
import { publishEvent } from "@/lib/publish";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let sql = "SELECT * FROM events WHERE 1=1";
    const params: unknown[] = [];

    if (type && type !== "all") {
      params.push(type);
      sql += ` AND event_type = $${params.length}`;
    }

    if (month && year) {
      params.push(parseInt(year), parseInt(month));
      sql += ` AND EXTRACT(YEAR FROM start_date) = $${params.length - 1} AND EXTRACT(MONTH FROM start_date) = $${params.length}`;
    }

    sql += " ORDER BY start_date ASC";

    const events = await getMany(sql, params);
    return apiSuccess(events);
  } catch (error) {
    console.error("Events GET error:", error);
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
    const parsed = parseBody(eventSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const data = parsed.data;

    const result = await query(
      `INSERT INTO events (title_kk, title_ru, description_kk, description_ru, image_url, event_type, start_date, end_date, location, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.title_kk,
        data.title_ru,
        data.description_kk,
        data.description_ru,
        data.image_url || null,
        data.event_type || "other",
        data.start_date,
        data.end_date || null,
        data.location || "",
        data.status || "upcoming",
      ]
    );

    const row = result.rows[0];
    if (row && row.status === "upcoming") {
      const start = new Date(row.start_date);
      if (!isNaN(start.getTime()) && start.getTime() > Date.now()) {
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
    }

    return apiSuccess(row, 201);
  } catch (error) {
    console.error("Events POST error:", error);
    return apiError("Internal server error", 500);
  }
}
