import { getOne } from "@/lib/db";

/**
 * Единый источник базового URL сайта для canonical/og/jsonld/sitemap.
 *
 * Читает `site_base_url` из таблицы `site_settings` (как sitemap/robots),
 * а НЕ из вшитого в билд `NEXT_PUBLIC_APP_URL`. Благодаря этому при смене
 * домена/туннеля достаточно обновить одну строку в БД — ребилд не нужен,
 * og:image и canonical следуют за живым адресом.
 *
 * ВАЖНО: страницы, которые используют этот хелпер в generateMetadata,
 * должны быть динамическими (`export const dynamic = "force-dynamic"`),
 * иначе значение из БД забэкается на этапе сборки.
 *
 * Порядок фолбэка: БД → NEXT_PUBLIC_APP_URL → прод-домен.
 */
export async function getSiteBaseUrl(): Promise<string> {
  try {
    const row = await getOne<{ value: string }>(
      `SELECT value FROM site_settings WHERE key = $1`,
      ["site_base_url"]
    );
    if (row?.value) return row.value.replace(/\/$/, "");
  } catch {
    // ignore — fallback below
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL || "https://dvorets-gornyakov.kz"
  ).replace(/\/$/, "");
}
