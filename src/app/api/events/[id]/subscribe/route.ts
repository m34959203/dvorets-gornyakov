import { NextRequest } from "next/server";
import { query, getOne } from "@/lib/db";
import { eventSubscribeSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(eventSubscribeSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const { email } = parsed.data;

    // Rate limiting: 5 subscriptions per email per hour (any event)
    const rateCheck = await getOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM event_subscriptions
        WHERE email = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [email]
    );
    if (rateCheck && parseInt(rateCheck.count, 10) >= 5) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    // Verify event exists
    const event = await getOne<{ id: string }>(
      `SELECT id FROM events WHERE id = $1`,
      [id]
    );
    if (!event) return apiError("Event not found", 404);

    await query(
      `INSERT INTO event_subscriptions (event_id, email)
       VALUES ($1, $2)
       ON CONFLICT (event_id, email) DO NOTHING`,
      [id, email]
    );

    return apiSuccess({ ok: true });
  } catch (error) {
    console.error("Event subscribe POST error:", error);
    return apiError("Internal server error", 500);
  }
}

const deleteSchema = z.object({ email: z.string().email() });

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = parseBody(deleteSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    await query(
      `DELETE FROM event_subscriptions WHERE event_id = $1 AND email = $2`,
      [id, parsed.data.email]
    );

    return apiSuccess({ ok: true });
  } catch (error) {
    console.error("Event subscribe DELETE error:", error);
    return apiError("Internal server error", 500);
  }
}
