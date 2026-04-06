import { NextRequest } from "next/server";
import { query, getMany } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { newsSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess, paginate, slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("limit") || "12", 10);
    const status = searchParams.get("status") || "published";
    const category = searchParams.get("category");

    const { limit, offset } = paginate(page, pageSize);

    let sql = "SELECT * FROM news WHERE status = $1";
    const params: unknown[] = [status];

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += " ORDER BY published_at DESC NULLS LAST, created_at DESC";
    params.push(limit, offset);
    sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const news = await getMany(sql, params);
    return apiSuccess(news);
  } catch (error) {
    console.error("News GET error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = parseBody(newsSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const data = parsed.data;
    const slug = slugify(data.title_ru || data.title_kk) + "-" + Date.now().toString(36);

    const result = await query(
      `INSERT INTO news (slug, title_kk, title_ru, content_kk, content_ru, excerpt_kk, excerpt_ru, image_url, category, author_id, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        slug,
        data.title_kk,
        data.title_ru,
        data.content_kk,
        data.content_ru,
        data.excerpt_kk || "",
        data.excerpt_ru || "",
        data.image_url || null,
        data.category || "general",
        user!.userId,
        data.status || "draft",
        data.status === "published" ? new Date() : null,
      ]
    );

    return apiSuccess(result.rows[0], 201);
  } catch (error) {
    console.error("News POST error:", error);
    return apiError("Internal server error", 500);
  }
}
