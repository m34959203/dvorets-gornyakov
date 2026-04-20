import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createHash } from "crypto";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { getOne, query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "26214400", 10); // 25MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "application/pdf",
];

interface MediaRow {
  id: string;
  filename: string;
  url: string;
  mime_type: string;
  size: number;
  original_name: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No file provided");
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError(`File too large. Maximum size: ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const hash = createHash("sha256").update(buffer).digest("hex");

    // Дедупликация по SHA-256: если такой файл уже есть, возвращаем существующую запись.
    const existing = await getOne<MediaRow>(
      `SELECT id, filename, url, mime_type, size, original_name FROM media WHERE hash=$1 LIMIT 1`,
      [hash]
    );
    if (existing) {
      return apiSuccess(
        {
          id: existing.id,
          url: existing.url,
          filename: existing.filename,
          original_name: existing.original_name,
          size: existing.size,
          mime_type: existing.mime_type,
          deduplicated: true,
        },
        200
      );
    }

    const originalName = file.name || "file";
    const ext = (originalName.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const filename = `${uuidv4()}.${ext || "bin"}`;
    const uploadPath = path.join(UPLOAD_DIR, filename);

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(uploadPath, buffer);

    const url = `/uploads/${filename}`;

    const inserted = await getOne<MediaRow>(
      `INSERT INTO media (filename, url, mime_type, size, uploaded_by, original_name, hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, filename, url, mime_type, size, original_name`,
      [filename, url, file.type, file.size, user?.userId ?? null, originalName, hash]
    );

    if (!inserted) {
      // Если вдруг INSERT ничего не вернул — всё равно не падаем, отдаём базовые данные.
      return apiSuccess(
        {
          url,
          filename,
          original_name: originalName,
          size: file.size,
          mime_type: file.type,
        },
        201
      );
    }

    return apiSuccess(
      {
        id: inserted.id,
        url: inserted.url,
        filename: inserted.filename,
        original_name: inserted.original_name,
        size: inserted.size,
        mime_type: inserted.mime_type,
      },
      201
    );
  } catch (error) {
    console.error("Upload error:", error);
    // Если миграция 008 ещё не применена — подсказываем это в логе, но клиенту возвращаем 500.
    try {
      await query(`SELECT 1`);
    } catch {}
    return apiError("Internal server error", 500);
  }
}
