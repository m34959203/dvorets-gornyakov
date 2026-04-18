import { NextRequest } from "next/server";
import { getOne, query } from "@/lib/db";
import { getCurrentUser, hashPassword, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { parseBody, userUpdateSchema } from "@/lib/validators";

interface UserRow {
  id: string;
  email: string;
  role: "admin" | "editor";
  name: string;
  created_at: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin"])) return apiError("Unauthorized", 401);
    const { id } = await params;

    const body = await request.json();
    const parsed = parseBody(userUpdateSchema, body);
    if ("error" in parsed) return apiError(parsed.error);
    const d = parsed.data;

    if (d.name === undefined && d.role === undefined && !(d.password && d.password.length > 0)) {
      return apiError("Nothing to update");
    }

    // Prevent self-demotion admin -> editor
    if (user && user.userId === id && d.role === "editor") {
      const current = await getOne<{ role: "admin" | "editor" }>(
        `SELECT role FROM users WHERE id=$1`,
        [id]
      );
      if (current?.role === "admin") {
        return apiError("Cannot demote yourself", 400);
      }
    }

    const sets: string[] = [];
    const values: unknown[] = [];

    if (d.name !== undefined) {
      values.push(d.name);
      sets.push(`name=$${values.length}`);
    }
    if (d.role !== undefined) {
      values.push(d.role);
      sets.push(`role=$${values.length}`);
    }
    if (d.password && d.password.length > 0) {
      const password_hash = await hashPassword(d.password);
      values.push(password_hash);
      sets.push(`password_hash=$${values.length}`);
    }

    values.push(id);
    const r = await query<UserRow>(
      `UPDATE users SET ${sets.join(", ")}
         WHERE id=$${values.length}
       RETURNING id, email, role, name, created_at`,
      values
    );
    if (!r.rows[0]) return apiError("Not found", 404);
    return apiSuccess({ user: r.rows[0] });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin"])) return apiError("Unauthorized", 401);
    const { id } = await params;

    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";
    if (password.length < 6) return apiError("Password must be at least 6 characters");

    const password_hash = await hashPassword(password);
    const r = await query(
      `UPDATE users SET password_hash=$1 WHERE id=$2 RETURNING id`,
      [password_hash, id]
    );
    if (!r.rows[0]) return apiError("Not found", 404);
    return apiSuccess({ ok: true });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin"])) return apiError("Unauthorized", 401);
    const { id } = await params;

    if (user && user.userId === id) {
      return apiError("Cannot delete yourself", 400);
    }

    const r = await query(`DELETE FROM users WHERE id=$1 RETURNING id`, [id]);
    if (r.rowCount === 0) return apiError("Not found", 404);
    return apiSuccess({ ok: true });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "23503") {
      return apiError("User has related content, transfer ownership first", 409);
    }
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
