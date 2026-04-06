import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";
import { loginSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = parseBody(loginSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const { email, password } = parsed.data;

    const result = await query<{ id: string; email: string; password_hash: string; role: string; name: string }>(
      "SELECT id, email, password_hash, role, name FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];
    if (!user) return apiError("Invalid credentials", 401);

    const valid = await verifyPassword(user.password_hash, password);
    if (!valid) return apiError("Invalid credentials", 401);

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role as "admin" | "editor",
      name: user.name,
    });

    await setAuthCookie(token);

    return apiSuccess({ user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (error) {
    console.error("Login error:", error);
    return apiError("Internal server error", 500);
  }
}
