import { NextRequest } from "next/server";
import { getMany, getOne } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface MediaRow {
  id: string;
  filename: string;
  url: string;
  mime_type: string;
  size: number;
  uploaded_by: string | null;
  created_at: string;
  original_name: string;
  width: number | null;
  height: number | null;
  alt_kk: string;
  alt_ru: string;
  hash: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }

    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim();
    const type = (url.searchParams.get("type") || "all").toLowerCase();
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("limit") || "24", 10) || 24)
    );
    const offset = (page - 1) * limit;

    const where: string[] = [];
    const values: unknown[] = [];

    if (q) {
      values.push(`%${q}%`);
      const idx = values.length;
      where.push(
        `(original_name ILIKE $${idx} OR filename ILIKE $${idx} OR alt_kk ILIKE $${idx} OR alt_ru ILIKE $${idx})`
      );
    }

    if (type === "image") {
      where.push(`mime_type LIKE 'image/%'`);
    } else if (type === "video") {
      where.push(`mime_type LIKE 'video/%'`);
    } else if (type === "other") {
      where.push(`mime_type NOT LIKE 'image/%' AND mime_type NOT LIKE 'video/%'`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countRow = await getOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM media ${whereSql}`,
      values
    );
    const total = parseInt(countRow?.count || "0", 10);

    const items = await getMany<MediaRow>(
      `SELECT id, filename, url, mime_type, size, uploaded_by, created_at,
              original_name, width, height, alt_kk, alt_ru, hash
       FROM media
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      values
    );

    return apiSuccess({ items, total, page, limit });
  } catch (e) {
    console.error("admin/media GET:", e);
    return apiError("Internal server error", 500);
  }
}
