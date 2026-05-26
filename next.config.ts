import type { NextConfig } from "next";

// CSP: permissive по script/style (Next использует inline), но с whitelist frame-src
// под Google Maps embed (блок контактов) и запретом object/base-uri.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "frame-src https://www.google.com https://maps.google.com",
  "connect-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  output: "standalone",
  // Раскрытие стека через заголовок не нужно
  poweredByHeader: false,
  // Baileys и его зависимости не бандлить — грузить из node_modules в рантайме
  serverExternalPackages: ["@whiskeysockets/baileys", "qrcode", "@hapi/boom"],
  allowedDevOrigins: ["192.168.50.13", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Статика-картинки: ранее max-age=0. Кэш на сутки + SWR-неделя (фото иногда
      // перезаписываются под тем же именем — без immutable, чтобы не залипало).
      {
        source: "/:dir(photos|hero)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      // Иконки — долгий кэш (меняются крайне редко)
      {
        source: "/:icon(favicon.ico|icon-192.png|icon-512.png)",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }],
      },
    ];
  },
};

export default nextConfig;
