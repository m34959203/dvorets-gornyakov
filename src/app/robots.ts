import type { MetadataRoute } from "next";

function getBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  const fallback = env || "https://dvorets-gornyakov.kz";
  return fallback.replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
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
