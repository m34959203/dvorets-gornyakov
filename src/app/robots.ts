import type { MetadataRoute } from "next";
import { getOne } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getBaseUrl(): Promise<string> {
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

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/*/admin/", "/*/admin"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
