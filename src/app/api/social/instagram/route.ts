import { NextRequest } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import {
  sendInstagramPost,
  formatNewsForInstagram,
  formatEventForInstagram,
} from "@/lib/instagram";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const { type, title_ru, title_kk, excerpt_ru, date, location, url, image_url } = body;

    if (!type || !title_ru || !title_kk || !image_url) {
      return apiError("Missing required fields: type, title_ru, title_kk, image_url");
    }

    let caption: string;
    if (type === "news") {
      caption = formatNewsForInstagram(title_ru, title_kk, excerpt_ru || "", url || "");
    } else if (type === "event") {
      caption = formatEventForInstagram(
        title_ru,
        title_kk,
        date || "",
        location || "",
        url || ""
      );
    } else {
      return apiError("Invalid type. Supported: news, event");
    }

    const success = await sendInstagramPost(image_url, caption);
    if (!success) {
      return apiError("Failed to publish to Instagram", 500);
    }

    return apiSuccess({ sent: true });
  } catch (error) {
    console.error("Instagram post error:", error);
    return apiError("Internal server error", 500);
  }
}
