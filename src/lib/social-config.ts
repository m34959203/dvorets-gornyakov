import { getOne, getMany, query } from "@/lib/db";
import type { SocialPlatform } from "@/lib/social-publications";

export interface SocialConfig {
  platform: SocialPlatform;
  enabled: boolean;
  default_language: "kk" | "ru";
  bot_token: string | null;
  chat_id: string | null;
  access_token: string | null;
  page_id: string | null;
  facebook_access_token: string | null;
  facebook_page_id: string | null;
  updated_at?: string;
}

const EDITABLE = [
  "enabled",
  "default_language",
  "bot_token",
  "chat_id",
  "access_token",
  "page_id",
  "facebook_access_token",
  "facebook_page_id",
] as const;

export async function getConfig(platform: SocialPlatform): Promise<SocialConfig | null> {
  try {
    return await getOne<SocialConfig>(`SELECT * FROM social_media_configs WHERE platform = $1`, [platform]);
  } catch {
    return null;
  }
}

export async function getAllConfigs(): Promise<SocialConfig[]> {
  try {
    return await getMany<SocialConfig>(`SELECT * FROM social_media_configs ORDER BY platform ASC`);
  } catch {
    return [];
  }
}

/** Частичное обновление конфига платформы (upsert). */
export async function updateConfig(
  platform: SocialPlatform,
  data: Partial<Omit<SocialConfig, "platform">>
): Promise<void> {
  const sets: string[] = [];
  const vals: unknown[] = [platform];
  for (const key of EDITABLE) {
    if (key in data) {
      vals.push((data as Record<string, unknown>)[key]);
      sets.push(`${key} = $${vals.length}`);
    }
  }
  if (sets.length === 0) return;
  // строки засеяны миграцией; на всякий случай гарантируем существование
  await query(`INSERT INTO social_media_configs (platform) VALUES ($1) ON CONFLICT (platform) DO NOTHING`, [platform]);
  await query(
    `UPDATE social_media_configs SET ${sets.join(", ")}, updated_at = NOW() WHERE platform = $1`,
    vals
  );
}
