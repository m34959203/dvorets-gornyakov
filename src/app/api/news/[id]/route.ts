import { NextRequest } from "next/server";
import { query, getOne } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { newsSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";
import { publishNews } from "@/lib/publish";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = await getOne(
      `SELECT * FROM news WHERE id = $1 OR slug = $1`,
      [id]
    );
    if (!row) return apiError("Not found", 404);
    return apiSuccess(row);
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
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(newsSchema, body);
    if ("error" in parsed) return apiError(parsed.error);
    const d = parsed.data;

    const existing = await getOne<{ status: string; published_at: Date | null }>(
      `SELECT status, published_at FROM news WHERE id = $1`,
      [id]
    );
    if (!existing) return apiError("Not found", 404);

    const status = d.status ?? existing.status;
    const publishedAt =
      status === "published" && !existing.published_at
        ? new Date()
        : existing.published_at;

    const result = await query(
      `UPDATE news SET title_kk=$1, title_ru=$2, content_kk=$3, content_ru=$4,
                       excerpt_kk=$5, excerpt_ru=$6, image_url=$7, video_url=$8,
                       embed_code=$9, category=$10, status=$11, published_at=$12
        WHERE id=$13 RETURNING *`,
      [
        d.title_kk,
        d.title_ru,
        d.content_kk,
        d.content_ru,
        d.excerpt_kk || "",
        d.excerpt_ru || "",
        d.image_url || null,
        d.video_url || null,
        d.embed_code || "",
        d.category || "general",
        status,
        publishedAt,
        id,
      ]
    );
    const row = result.rows[0];
    if (row && status === "published" && existing.status !== "published") {
      publishNews({
        slug: row.slug,
        title_ru: row.title_ru,
        title_kk: row.title_kk,
        excerpt_ru: row.excerpt_ru,
        excerpt_kk: row.excerpt_kk,
        image_url: row.image_url,
      }).catch(console.error);
    }
    return apiSuccess(row);
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}

const patchSchema = z.object({
  status: z.enum(["draft", "published", "archived"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(patchSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const existing = await getOne<{ status: string }>(
      `SELECT status FROM news WHERE id = $1`,
      [id]
    );
    if (!existing) return apiError("Not found", 404);

    const result = await query(
      `UPDATE news
          SET status=$1,
              published_at = CASE WHEN $1 = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END
        WHERE id=$2 RETURNING *`,
      [parsed.data.status, id]
    );
    if (!result.rows[0]) return apiError("Not found", 404);
    const row = result.rows[0];
    if (parsed.data.status === "published" && existing.status !== "published") {
      publishNews({
        slug: row.slug,
        title_ru: row.title_ru,
        title_kk: row.title_kk,
        excerpt_ru: row.excerpt_ru,
        excerpt_kk: row.excerpt_kk,
        image_url: row.image_url,
      }).catch(console.error);
    }
    return apiSuccess(row);
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
    const result = await query(`DELETE FROM news WHERE id=$1 RETURNING id`, [id]);
    if (result.rowCount === 0) return apiError("Not found", 404);
    return apiSuccess({ ok: true });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
