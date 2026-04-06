import { NextRequest } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { sendTelegramMessage, formatNewsForTelegram, formatEventForTelegram } from "@/lib/telegram";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const { type, title, excerpt, date, location, url } = body;

    if (!type || !title) {
      return apiError("Missing required fields: type, title");
    }

    let message: string;
    if (type === "news") {
      message = formatNewsForTelegram(title, excerpt || "", url || "");
    } else if (type === "event") {
      message = formatEventForTelegram(title, date || "", location || "", url || "");
    } else {
      return apiError("Invalid type. Supported: news, event");
    }

    const success = await sendTelegramMessage(message);
    if (!success) {
      return apiError("Failed to send message to Telegram", 500);
    }

    return apiSuccess({ sent: true });
  } catch (error) {
    console.error("Telegram post error:", error);
    return apiError("Internal server error", 500);
  }
}
