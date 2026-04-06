import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880", 10);

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

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
      return apiError(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`);
    }

    const ext = file.name.split(".").pop() || "bin";
    const filename = `${uuidv4()}.${ext}`;
    const uploadPath = path.join(UPLOAD_DIR, filename);

    await mkdir(UPLOAD_DIR, { recursive: true });

    const bytes = await file.arrayBuffer();
    await writeFile(uploadPath, Buffer.from(bytes));

    const url = `/uploads/${filename}`;

    return apiSuccess({ url, filename, size: file.size, mime_type: file.type }, 201);
  } catch (error) {
    console.error("Upload error:", error);
    return apiError("Internal server error", 500);
  }
}
