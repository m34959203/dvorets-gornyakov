import { NextRequest } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { getStatus, connect, disconnect, logout } from "@/lib/wa/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!requireRole(user, ["admin"])) return apiError("Unauthorized", 401);
  return apiSuccess(getStatus());
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!requireRole(user, ["admin"])) return apiError("Unauthorized", 401);

  let action = "";
  try {
    action = (await request.json())?.action ?? "";
  } catch {
    return apiError("Invalid body");
  }

  switch (action) {
    case "connect":
      connect().catch((e) => console.error("[wa] connect:", e)); // fire-and-forget
      return apiSuccess({ ok: true, ...getStatus() });
    case "disconnect":
      await disconnect();
      return apiSuccess({ ok: true, ...getStatus() });
    case "logout":
      await logout();
      return apiSuccess({ ok: true, ...getStatus() });
    default:
      return apiError("Unknown action");
  }
}
