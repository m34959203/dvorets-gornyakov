import { NextRequest } from "next/server";
import { query, getOne } from "@/lib/db";
import { rentalRequestSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";
import { notifyRentalRequest } from "@/lib/rent/notifications";
import type { RentalRequest } from "@/lib/rent/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = parseBody(rentalRequestSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const data = parsed.data;

    // Honeypot: bots often fill every field
    if (data.website && data.website.length > 0) {
      return apiError("spam detected", 400);
    }

    // Time order
    if (data.time_to <= data.time_from) {
      return apiError("time_to must be greater than time_from");
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Rate limit: 3/hour/IP
    const rate = await getOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM rental_requests
        WHERE ip_address = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [ip]
    );
    if (rate && parseInt(rate.count, 10) >= 3) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    // Hall existence + active
    const hall = await getOne<{ id: string; name_ru: string; is_active: boolean }>(
      "SELECT id, name_ru, is_active FROM halls WHERE id = $1",
      [data.hall_id]
    );
    if (!hall) return apiError("Hall not found", 404);
    if (!hall.is_active) return apiError("Hall is not available", 400);

    // Insert
    const result = await query<RentalRequest>(
      `INSERT INTO rental_requests (
         hall_id, name, phone, email, event_type, event_date,
         time_from, time_to, guests, equipment, message, ip_address
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12)
       RETURNING *`,
      [
        data.hall_id,
        data.name,
        data.phone,
        data.email,
        data.event_type,
        data.event_date,
        data.time_from,
        data.time_to,
        data.guests,
        JSON.stringify(data.equipment),
        data.message ?? "",
        ip,
      ]
    );

    const created = result.rows[0];

    // Fire-and-forget notify
    notifyRentalRequest(created, hall.name_ru).catch((e) =>
      console.error("[rent] notify failed:", e)
    );

    return apiSuccess(
      { id: created.id, message: "Заявка принята. Администратор свяжется с вами." },
      201
    );
  } catch (error) {
    console.error("POST /api/rent/request error:", error);
    return apiError("Internal server error", 500);
  }
}
