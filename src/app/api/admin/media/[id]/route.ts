import { NextRequest } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { z } from "zod";
import { getOne, query } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { parseBody } from "@/lib/validators";

export const runtime = "nodejs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads";

const patchSchema = z.object({
  alt_kk: z.string().max(500).optional(),
  alt_ru: z.string().max(500).optional(),
  original_name: z.string().max(500).optional(),
});

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }
    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(patchSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const d = parsed.data;
    const sets: string[] = [];
    const values: unknown[] = [];

    if (d.alt_kk !== undefined) {
      values.push(d.alt_kk);
      sets.push(`alt_kk=$${values.length}`);
    }
    if (d.alt_ru !== undefined) {
      values.push(d.alt_ru);
      sets.push(`alt_ru=$${values.length}`);
    }
    if (d.original_name !== undefined) {
      values.push(d.original_name);
      sets.push(`original_name=$${values.length}`);
    }

    if (!sets.length) return apiError("Nothing to update");

    values.push(id);
    const row = await getOne<MediaRow>(
      `UPDATE media SET ${sets.join(", ")} WHERE id=$${values.length}
       RETURNING id, filename, url, mime_type, size, uploaded_by, created_at,
                 original_name, width, height, alt_kk, alt_ru, hash`,
      values
    );
    if (!row) return apiError("Not found", 404);
    return apiSuccess(row);
  } catch (e) {
    console.error("admin/media PATCH:", e);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin"])) {
      return apiError("Unauthorized", 401);
    }
    const { id } = await params;

    const row = await getOne<MediaRow>(
      `SELECT id, url, filename FROM media WHERE id=$1 LIMIT 1`,
      [id]
    );
    if (!row) return apiError("Not found", 404);

    // Удаляем файл с диска только если он лежит в /uploads/ (не трогаем внешние URL)
    if (row.url && row.url.startsWith("/uploads/")) {
      const safeName = path.basename(row.url);
      const filePath = path.join(UPLOAD_DIR, safeName);
      try {
        await unlink(filePath);
      } catch (err) {
        // Файла может уже не быть — это не критично, просто логируем.
        console.warn("media DELETE: unlink failed", filePath, err);
      }
    }

    const result = await query(`DELETE FROM media WHERE id=$1 RETURNING id`, [id]);
    if (result.rowCount === 0) return apiError("Not found", 404);
    return apiSuccess({ ok: true });
  } catch (e) {
    console.error("admin/media DELETE:", e);
    return apiError("Internal server error", 500);
  }
}
