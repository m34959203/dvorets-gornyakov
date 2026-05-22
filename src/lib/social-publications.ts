import { getOne, query } from "@/lib/db";

export type SocialPlatform = "telegram" | "instagram" | "facebook";
export type PublishKind = "news" | "events";

/** Уже была успешная публикация этого элемента на платформу? (дедуп) */
export async function alreadyPublished(
  kind: PublishKind,
  itemId: string,
  platform: SocialPlatform
): Promise<boolean> {
  try {
    const row = await getOne<{ id: string }>(
      `SELECT id FROM social_publications
        WHERE kind = $1 AND item_id = $2 AND platform = $3 AND status = 'success'
        LIMIT 1`,
      [kind, itemId, platform]
    );
    return Boolean(row);
  } catch {
    return false; // при сбое БД лучше попробовать опубликовать, чем молча пропустить
  }
}

/** Записать результат попытки публикации. */
export async function recordPublication(
  kind: PublishKind,
  itemId: string,
  platform: SocialPlatform,
  status: "success" | "failed",
  opts: { externalId?: string | null; error?: string | null } = {}
): Promise<void> {
  try {
    await query(
      `INSERT INTO social_publications (kind, item_id, platform, status, external_id, error)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [kind, itemId, platform, status, opts.externalId ?? null, opts.error ?? null]
    );
  } catch (e) {
    console.error("[social] recordPublication failed:", e);
  }
}
