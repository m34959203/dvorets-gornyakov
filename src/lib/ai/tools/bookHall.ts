import { z } from "zod";
import { getOne } from "@/lib/db";

// Gemini FunctionDeclaration для брони зала. Используется в /api/chatbot.
export const bookHallDeclaration = {
  name: "book_hall",
  description:
    "Создать заявку на аренду зала Дворца горняков. Вызывай ТОЛЬКО когда собраны ВСЕ " +
    "обязательные параметры и пользователь подтвердил бронь. Перед вызовом дружелюбно " +
    "уточни недостающие поля.",
  parameters: {
    type: "object",
    properties: {
      hall: {
        type: "string",
        enum: ["big", "chamber", "rehearsal"],
        description: "big=Большой концертный (650), chamber=Камерный (120), rehearsal=Репетиционный (40)",
      },
      date: { type: "string", description: "Дата в формате YYYY-MM-DD, не раньше завтрашнего дня" },
      start_time: { type: "string", description: "Время начала HH:MM (24ч)" },
      end_time: { type: "string", description: "Время окончания HH:MM (24ч), позже start_time" },
      organizer: { type: "string", description: "ФИО или название организации" },
      phone: { type: "string", description: "Телефон в формате +7XXXXXXXXXX" },
      purpose: { type: "string", description: "Цель мероприятия, 1–2 предложения" },
      attendees: { type: "integer", description: "Ожидаемое число гостей (>0)" },
    },
    required: ["hall", "date", "start_time", "end_time", "organizer", "phone", "purpose", "attendees"],
  },
} as const;

// Жёсткая валидация на сервере (LLM может не соблюсти схему).
export const bookHallSchema = z.object({
  hall: z.enum(["big", "chamber", "rehearsal"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "start_time HH:MM"),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "end_time HH:MM"),
  organizer: z.string().trim().min(2).max(255),
  phone: z.string().regex(/^\+7\d{10}$/, "phone must be +7XXXXXXXXXX"),
  purpose: z.string().trim().min(3).max(1000),
  attendees: z.coerce.number().int().positive().max(2000),
});

export type BookHallArgs = z.infer<typeof bookHallSchema>;

export interface BookHallResult {
  ok: boolean;
  id?: string;
  ref?: string; // короткий номер заявки для пользователя
  error?: string;
}

const HALL_CAP: Record<BookHallArgs["hall"], number> = { big: 650, chamber: 120, rehearsal: 40 };

/** Валидирует аргументы tool_call и создаёт бронь (status=pending). */
export async function runBookHall(rawArgs: unknown, locale: string): Promise<BookHallResult> {
  const parsed = bookHallSchema.safeParse(rawArgs);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const a = parsed.data;

  // Дата не раньше завтра.
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (new Date(`${a.date}T00:00:00`) < tomorrow) {
    return { ok: false, error: "date must be tomorrow or later" };
  }
  if (a.end_time <= a.start_time) {
    return { ok: false, error: "end_time must be after start_time" };
  }
  if (a.attendees > HALL_CAP[a.hall]) {
    return { ok: false, error: `attendees exceed hall capacity (${HALL_CAP[a.hall]})` };
  }

  try {
    const row = await getOne<{ id: string }>(
      `INSERT INTO bookings (hall, date, start_time, end_time, organizer, phone, purpose, attendees, source, locale)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'chatbot',$9) RETURNING id`,
      [a.hall, a.date, a.start_time, a.end_time, a.organizer, a.phone, a.purpose, a.attendees, locale === "kk" ? "kk" : "ru"]
    );
    if (!row) return { ok: false, error: "db_error" };
    return { ok: true, id: row.id, ref: row.id.slice(0, 8).toUpperCase() };
  } catch (e) {
    console.error("runBookHall insert error:", e);
    return { ok: false, error: "db_error" };
  }
}
