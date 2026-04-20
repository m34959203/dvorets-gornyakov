import { getMany } from "@/lib/db";
import { getLocalizedField, type Locale } from "@/lib/i18n";

export interface NavItemRow {
  id: string;
  slug: string;
  title_kk: string;
  title_ru: string;
  url: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  target: "_self" | "_blank";
  created_at: string;
}

export interface NavItem {
  id: string;
  slug: string;
  title: string;
  url: string;
  target: "_self" | "_blank";
  children: NavItem[];
}

/**
 * Localize a href: if it starts with "/" (internal), prefix /{locale}.
 * Otherwise (http(s)://, mailto:, tel:, #anchor) — return as-is.
 */
export function localizeHref(url: string, locale: Locale): string {
  if (!url) return `/${locale}`;
  if (url.startsWith("/")) {
    if (url === "/") return `/${locale}`;
    return `/${locale}${url}`;
  }
  return url;
}

/**
 * Build a two-level menu tree from active nav_items.
 * Roots are parent_id IS NULL, children attached by parent_id.
 */
export async function getNavTree(locale: Locale): Promise<NavItem[]> {
  const rows = await getMany<NavItemRow>(
    `SELECT id, slug, title_kk, title_ru, url, parent_id, sort_order, is_active, target, created_at
       FROM nav_items
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, created_at ASC`
  );

  const byId = new Map<string, NavItem>();
  const roots: NavItem[] = [];

  for (const r of rows) {
    byId.set(r.id, {
      id: r.id,
      slug: r.slug,
      title: getLocalizedField(r, "title", locale),
      url: r.url,
      target: r.target === "_blank" ? "_blank" : "_self",
      children: [],
    });
  }

  for (const r of rows) {
    const node = byId.get(r.id)!;
    if (r.parent_id && byId.has(r.parent_id)) {
      byId.get(r.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
