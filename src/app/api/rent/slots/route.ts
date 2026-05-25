import { NextRequest } from "next/server";
import { getMany } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/utils";

// Занятые слоты залов на дату — из брони (bookings), статусы pending/approved.
// Публичный read-only: показывает реальную занятость в календаре /rent.
export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return apiError("date required (YYYY-MM-DD)");
    const rows = await getMany<{ hall: string; start_time: string; end_time: string; status: string }>(
      `SELECT hall, to_char(start_time,'HH24:MI') AS start_time, to_char(end_time,'HH24:MI') AS end_time, status
         FROM bookings
        WHERE date = $1 AND status IN ('pending','approved')`,
      [date]
    );
    return apiSuccess({ slots: rows });
  } catch (error) {
    console.error("GET /api/rent/slots error:", error);
    return apiError("Internal server error", 500);
  }
}
