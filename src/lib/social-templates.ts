import { getOne } from "@/lib/db";

type Platform = "telegram" | "instagram";
type Kind = "news" | "event";

interface TemplateRow {
  id: string;
  body_kk: string;
  body_ru: string;
}

export async function getDefaultTemplate(
  platform: Platform,
  kind: Kind
): Promise<TemplateRow | null> {
  return await getOne<TemplateRow>(
    `SELECT id, body_kk, body_ru
       FROM social_templates
      WHERE platform = $1 AND kind = $2 AND is_default = TRUE AND is_active = TRUE
      LIMIT 1`,
    [platform, kind]
  );
}

export function renderTemplate(
  body: string,
  vars: Record<string, string | undefined | null>
): string {
  return body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key: string) => {
    const v = vars[key];
    return v == null ? "" : String(v);
  });
}
