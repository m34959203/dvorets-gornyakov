import { getMany } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const items = await getMany(
      `SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC`
    );
    return apiSuccess({ items });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
