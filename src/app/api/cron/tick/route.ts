import { NextRequest } from "next/server";
import { runPendingJobs } from "@/lib/scheduler";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (token !== secret) return apiError("Unauthorized", 401);
  }
  try {
    const result = await runPendingJobs();
    return apiSuccess(result);
  } catch (e) {
    console.error("cron tick error:", e);
    return apiError("Internal server error", 500);
  }
}

export const GET = POST;
