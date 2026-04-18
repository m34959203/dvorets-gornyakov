import type { MetadataRoute } from "next";
import { getOne, getMany } from "@/lib/db";

const STATIC_PATHS: Array<{
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1.0 },
  { path: "/news", changeFrequency: "daily", priority: 0.8 },
  { path: "/events", changeFrequency: "daily", priority: 0.8 },
  { path: "/clubs", changeFrequency: "weekly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contacts", changeFrequency: "monthly", priority: 0.6 },
  { path: "/resources", changeFrequency: "monthly", priority: 0.6 },
  { path: "/rules", changeFrequency: "monthly", priority: 0.6 },
  { path: "/rent", changeFrequency: "weekly", priority: 0.9 },
];

const LOCALES = ["kk", "ru"] as const;

async function resolveBaseUrl(): Promise<string> {
  try {
    const row = await getOne<{ value: string }>(
      `SELECT value FROM site_settings WHERE key = $1`,
      ["site_base_url"]
    );
    if (row?.value) return row.value.replace(/\/$/, "");
  } catch {
    // ignore — fallback below
  }
  const env = process.env.NEXT_PUBLIC_APP_URL;
  const fallback = env || "https://dvorets-gornyakov.kz";
  return fallback.replace(/\/$/, "");
}

async function loadPublishedNews(): Promise<
  Array<{ slug: string; published_at: Date | null }>
> {
  try {
    return await getMany<{ slug: string; published_at: Date | null }>(
      `SELECT slug, published_at FROM news WHERE status = 'published'`
    );
  } catch {
    return [];
  }
}

async function loadUpcomingEvents(): Promise<
  Array<{ id: string; start_date: Date | null }>
> {
  try {
    return await getMany<{ id: string; start_date: Date | null }>(
      `SELECT id, start_date FROM events WHERE status IN ('upcoming', 'ongoing')`
    );
  } catch {
    return [];
  }
}

async function loadActiveClubs(): Promise<Array<{ id: string }>> {
  try {
    return await getMany<{ id: string }>(
      `SELECT id FROM clubs WHERE is_active = TRUE`
    );
  } catch {
    return [];
  }
}

async function loadActiveHalls(): Promise<Array<{ slug: string }>> {
  try {
    return await getMany<{ slug: string }>(
      `SELECT slug FROM halls WHERE is_active = TRUE`
    );
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await resolveBaseUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Static routes for each locale
  for (const locale of LOCALES) {
    for (const { path, changeFrequency, priority } of STATIC_PATHS) {
      entries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
      });
    }
  }

  const [news, events, clubs, halls] = await Promise.all([
    loadPublishedNews(),
    loadUpcomingEvents(),
    loadActiveClubs(),
    loadActiveHalls(),
  ]);

  for (const item of news) {
    const lastModified = item.published_at ? new Date(item.published_at) : now;
    for (const locale of LOCALES) {
      entries.push({
        url: `${baseUrl}/${locale}/news/${item.slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  for (const item of events) {
    const lastModified = item.start_date ? new Date(item.start_date) : now;
    for (const locale of LOCALES) {
      entries.push({
        url: `${baseUrl}/${locale}/events/${item.id}`,
        lastModified,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  }

  for (const item of clubs) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${baseUrl}/${locale}/clubs/${item.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  for (const item of halls) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${baseUrl}/${locale}/rent/${item.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
