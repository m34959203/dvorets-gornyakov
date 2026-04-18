import { NextRequest } from "next/server";
import pool, { getMany } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { settingsBulkSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";

interface SettingRow {
  key: string;
  value: string;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }

    const rows = await getMany<SettingRow>(
      `SELECT key, value FROM site_settings ORDER BY key ASC`
    );

    return apiSuccess({ items: rows });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin"])) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = parseBody(settingsBulkSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const { items } = parsed.data;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const item of items) {
        await client.query(
          `INSERT INTO site_settings (key, value) VALUES ($1, $2)
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [item.key, item.value]
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    return apiSuccess({ ok: true, count: items.length });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);
    return apiError("Internal server error", 500);
  }
}
