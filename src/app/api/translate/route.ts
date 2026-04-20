import { NextRequest } from "next/server";
import { translateText } from "@/lib/gemini";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const { text, from, to } = body;

    if (!text || !from || !to) {
      return apiError("Missing required fields: text, from, to");
    }

    if (!["kk", "ru"].includes(from) || !["kk", "ru"].includes(to)) {
      return apiError("Invalid language. Supported: kk, ru");
    }

    const translated = await translateText(text, from, to, { userId: user?.userId });
    return apiSuccess({ translated });
  } catch (error) {
    console.error("Translate error:", error);
    return apiError("Internal server error", 500);
  }
}
