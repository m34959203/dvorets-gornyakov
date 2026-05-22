import { query, getOne } from "@/lib/db";
import { notifyRentalRequest } from "@/lib/rent/notifications";
import type { RentalRequest } from "@/lib/rent/types";

export interface CreateRentalInput {
  hall_id: string;
  name: string;
  phone: string;
  email: string;
  event_type: RentalRequest["event_type"];
  event_date: string;
  time_from: string;
  time_to: string;
  guests: number;
  equipment?: RentalRequest["equipment"];
  message?: string;
  ip_address?: string | null;
  /** Источник: 'web' | 'telegram' | 'whatsapp' — попадает в message-префикс. */
  source?: string;
}

export type CreateRentalResult =
  | { ok: true; request: RentalRequest; hallName: string }
  | { ok: false; error: string; code: number };

/**
 * Создаёт заявку на аренду: проверяет зал, валидирует время, пишет в БД,
 * шлёт уведомление оператору. Общая для веб-формы и ботов.
 */
export async function createRentalRequest(input: CreateRentalInput): Promise<CreateRentalResult> {
  if (input.time_to <= input.time_from) {
    return { ok: false, error: "time_to must be greater than time_from", code: 400 };
  }

  const hall = await getOne<{ id: string; name_ru: string; is_active: boolean }>(
    "SELECT id, name_ru, is_active FROM halls WHERE id = $1",
    [input.hall_id]
  );
  if (!hall) return { ok: false, error: "Hall not found", code: 404 };
  if (!hall.is_active) return { ok: false, error: "Hall is not available", code: 400 };

  const message = input.source && input.source !== "web"
    ? `[${input.source}] ${input.message ?? ""}`.trim()
    : input.message ?? "";

  const result = await query<RentalRequest>(
    `INSERT INTO rental_requests (
       hall_id, name, phone, email, event_type, event_date,
       time_from, time_to, guests, equipment, message, ip_address
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12)
     RETURNING *`,
    [
      input.hall_id,
      input.name,
      input.phone,
      input.email,
      input.event_type,
      input.event_date,
      input.time_from,
      input.time_to,
      input.guests,
      JSON.stringify(input.equipment ?? []),
      message,
      input.ip_address ?? null,
    ]
  );

  const created = result.rows[0];
  notifyRentalRequest(created, hall.name_ru).catch((e) =>
    console.error("[rent] notify failed:", e)
  );

  return { ok: true, request: created, hallName: hall.name_ru };
}
