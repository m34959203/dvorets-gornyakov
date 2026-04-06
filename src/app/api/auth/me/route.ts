import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Unauthorized", 401);
    return apiSuccess({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return apiError("Internal server error", 500);
  }
}
