import { NextRequest } from "next/server";
import { getMany, getOne } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { chatbotKbSchema, parseBody } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";

interface KbRow {
  id: string;
  category: string;
  question_kk: string;
  question_ru: string;
  answer_kk: string;
  answer_ru: string;
  created_at: string;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }

    const category = req.nextUrl.searchParams.get("category");
    const params: unknown[] = [];
    let where = "";
    if (category) {
      params.push(category);
      where = `WHERE category = $1`;
    }

    const rows = await getMany<KbRow>(
      `SELECT id, category, question_kk, question_ru, answer_kk, answer_ru, created_at
         FROM chatbot_knowledge
         ${where}
        ORDER BY created_at DESC`,
      params
    );

    return apiSuccess({ items: rows });
  } catch (error) {
    console.error("GET /api/admin/chatbot-kb error:", error);
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
    const parsed = parseBody(chatbotKbSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const { category, question_kk, question_ru, answer_kk, answer_ru } = parsed.data;

    const row = await getOne<KbRow>(
      `INSERT INTO chatbot_knowledge (category, question_kk, question_ru, answer_kk, answer_ru)
         VALUES ($1, $2, $3, $4, $5)
       RETURNING id, category, question_kk, question_ru, answer_kk, answer_ru, created_at`,
      [category, question_kk, question_ru, answer_kk, answer_ru]
    );

    return apiSuccess({ item: row }, 201);
  } catch (error) {
    console.error("POST /api/admin/chatbot-kb error:", error);
    return apiError("Internal server error", 500);
  }
}
