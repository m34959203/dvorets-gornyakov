import { NextRequest } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { getAllConfigs, updateConfig, type SocialConfig } from "@/lib/social-config";
import type { SocialPlatform } from "@/lib/social-publications";

const PLATFORMS: SocialPlatform[] = ["telegram", "instagram", "facebook"];

const STRING_FIELDS = [
  "bot_token",
  "chat_id",
  "access_token",
  "page_id",
  "facebook_access_token",
  "facebook_page_id",
] as const;

export async function GET() {
  const user = await getCurrentUser();
  if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
  return apiSuccess({ configs: await getAllConfigs() });
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!requireRole(user, ["admin"])) return apiError("Unauthorized", 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid body");
  }

  const platform = body.platform as SocialPlatform;
  if (!PLATFORMS.includes(platform)) return apiError("Unknown platform");

  const data: Partial<Omit<SocialConfig, "platform">> = {};
  if (typeof body.enabled === "boolean") data.enabled = body.enabled;
  if (body.default_language === "kk" || body.default_language === "ru") {
    data.default_language = body.default_language;
  }
  for (const f of STRING_FIELDS) {
    if (typeof body[f] === "string") (data as Record<string, unknown>)[f] = (body[f] as string).trim() || null;
  }

  await updateConfig(platform, data);
  return apiSuccess({ ok: true });
}
