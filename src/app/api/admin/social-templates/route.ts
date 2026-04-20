import { NextRequest } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

const createSchema = z.object({
  platform: z.enum(["telegram", "instagram"]),
  kind: z.enum(["news", "event"]),
  name: z.string().min(1).max(100),
  body_kk: z.string().default(""),
  body_ru: z.string().default(""),
  is_default: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const { searchParams } = request.nextUrl;
    const platform = searchParams.get("platform") || "";
    const kind = searchParams.get("kind") || "";
    const where: string[] = [];
    const params: unknown[] = [];
    if (platform) {
      params.push(platform);
      where.push(`platform = $${params.length}`);
    }
    if (kind) {
      params.push(kind);
      where.push(`kind = $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const r = await query(
      `SELECT id, platform, kind, name, body_kk, body_ru, is_default, is_active, created_at
         FROM social_templates ${whereSql}
        ORDER BY platform, kind, is_default DESC, created_at DESC`,
      params
    );
    return apiSuccess({ items: r.rows });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "invalid");
    const d = parsed.data;

    if (d.is_default) {
      await query(
        `UPDATE social_templates SET is_default = FALSE WHERE platform = $1 AND kind = $2 AND is_default = TRUE`,
        [d.platform, d.kind]
      );
    }

    const r = await query(
      `INSERT INTO social_templates (platform, kind, name, body_kk, body_ru, is_default, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [d.platform, d.kind, d.name, d.body_kk, d.body_ru, d.is_default, d.is_active]
    );
    return apiSuccess(r.rows[0], 201);
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
