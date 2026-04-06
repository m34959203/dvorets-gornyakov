import { NextRequest } from "next/server";
import { query, getOne } from "@/lib/db";
import { enrollmentSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = parseBody(enrollmentSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const data = parsed.data;
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    // Rate limiting: 3 per IP per hour
    const rateCheck = await getOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM enrollments WHERE ip_address = $1 AND created_at > NOW() - INTERVAL '1 hour'",
      [ip]
    );

    if (rateCheck && parseInt(rateCheck.count, 10) >= 3) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    // Verify club exists and is active
    const club = await getOne<{ id: string; is_active: boolean }>(
      "SELECT id, is_active FROM clubs WHERE id = $1",
      [data.club_id]
    );

    if (!club) return apiError("Club not found", 404);
    if (!club.is_active) return apiError("Club is not accepting enrollments", 400);

    const result = await query(
      `INSERT INTO enrollments (club_id, child_name, child_age, parent_name, phone, email, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [data.club_id, data.child_name, data.child_age, data.parent_name, data.phone, data.email || null, ip]
    );

    return apiSuccess({ id: result.rows[0].id, message: "Enrollment submitted successfully" }, 201);
  } catch (error) {
    console.error("Enrollment error:", error);
    return apiError("Internal server error", 500);
  }
}
