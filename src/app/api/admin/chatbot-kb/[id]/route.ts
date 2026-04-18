import { NextRequest } from "next/server";
import { query, getOne } from "@/lib/db";
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }
    const { id } = await params;
    const row = await getOne<KbRow>(
      `SELECT id, category, question_kk, question_ru, answer_kk, answer_ru, created_at
         FROM chatbot_knowledge WHERE id = $1`,
      [id]
    );
    if (!row) return apiError("Not found", 404);
    return apiSuccess({ item: row });
  } catch (error) {
    console.error("GET /api/admin/chatbot-kb/[id] error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function PUT(
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
    const parsed = parseBody(chatbotKbSchema, body);
    if ("error" in parsed) return apiError(parsed.error);

    const { category, question_kk, question_ru, answer_kk, answer_ru } = parsed.data;

    const result = await query<KbRow>(
      `UPDATE chatbot_knowledge
          SET category = $1,
              question_kk = $2,
              question_ru = $3,
              answer_kk = $4,
              answer_ru = $5
        WHERE id = $6
      RETURNING id, category, question_kk, question_ru, answer_kk, answer_ru, created_at`,
      [category, question_kk, question_ru, answer_kk, answer_ru, id]
    );
    if (!result.rows[0]) return apiError("Not found", 404);
    return apiSuccess({ item: result.rows[0] });
  } catch (error) {
    console.error("PUT /api/admin/chatbot-kb/[id] error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin"])) {
      return apiError("Unauthorized", 401);
    }
    const { id } = await params;
    const result = await query(
      `DELETE FROM chatbot_knowledge WHERE id = $1`,
      [id]
    );
    if (result.rowCount === 0) return apiError("Not found", 404);
    return apiSuccess({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/chatbot-kb/[id] error:", error);
    return apiError("Internal server error", 500);
  }
}
