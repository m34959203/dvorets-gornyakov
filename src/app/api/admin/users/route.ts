import { NextRequest } from "next/server";
import { getMany, query } from "@/lib/db";
import { getCurrentUser, hashPassword, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { parseBody, userCreateSchema } from "@/lib/validators";

interface UserRow {
  id: string;
  email: string;
  role: "admin" | "editor";
  name: string;
  created_at: string;
}

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);

    const items = await getMany<UserRow>(
      `SELECT id, email, role, name, created_at
         FROM users
        ORDER BY created_at DESC`
    );
    return apiSuccess({ items });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin"])) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = parseBody(userCreateSchema, body);
    if ("error" in parsed) return apiError(parsed.error);
    const d = parsed.data;

    const password_hash = await hashPassword(d.password);

    const r = await query<UserRow>(
      `INSERT INTO users (email, password_hash, name, role)
         VALUES ($1, $2, $3, $4)
       RETURNING id, email, role, name, created_at`,
      [d.email, password_hash, d.name, d.role]
    );
    return apiSuccess({ user: r.rows[0] }, 201);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "23505") {
      return apiError("Email already exists", 409);
    }
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
