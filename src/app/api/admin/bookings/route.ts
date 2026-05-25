import { NextRequest } from "next/server";
import { getMany } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

export interface BookingRow {
  id: string;
  hall: "big" | "chamber" | "rehearsal";
  date: string;
  start_time: string;
  end_time: string;
  organizer: string;
  phone: string;
  purpose: string;
  attendees: number;
  status: "pending" | "approved" | "rejected" | "completed";
  source: string;
  locale: string;
  notes_admin: string | null;
  created_at: string;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);

    const status = req.nextUrl.searchParams.get("status");
    const params: unknown[] = [];
    let where = "";
    if (status) {
      if (!/^(pending|approved|rejected|completed)$/.test(status)) return apiError("Invalid status");
      params.push(status);
      where = `WHERE status = $1`;
    }
    const rows = await getMany<BookingRow>(
      `SELECT * FROM bookings ${where} ORDER BY date DESC, created_at DESC LIMIT 200`,
      params
    );
    return apiSuccess({ bookings: rows });
  } catch (error) {
    console.error("GET /api/admin/bookings error:", error);
    return apiError("Internal server error", 500);
  }
}
