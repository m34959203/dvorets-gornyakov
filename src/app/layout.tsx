import type { Metadata } from "next";
import { getSiteBaseUrl } from "@/lib/site-url";
import "./globals.css";

const SITE_TITLE = "Дворец горняков им. Ш. Дильдебаева — Сатпаев";
const SITE_DESC =
  "КГКП «Центр культуры и творчества им. Ш. Дильдебаева» (Дворец горняков) — культурный центр города Сатпаев, область Ұлытау. 22 коллектива, 3 зала, афиша концертов и событий.";

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = await getSiteBaseUrl();
  return {
  metadataBase: new URL(BASE_URL),
  // Простая строка-фолбэк (без template) — иначе template оборачивал бы
  // локализованный title публичного layout русским суффиксом на /kk.
  // Локаль-специфичные title/template живут в [locale]/(public)/layout.tsx.
  title: SITE_TITLE,
  description: SITE_DESC,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    type: "website",
    siteName: "Дворец горняков им. Ш. Дильдебаева",
    images: [
      {
        url: "/photos/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Дворец горняков им. Ш. Дильдебаева с памятником К. И. Сатпаеву, г. Сатпаев",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ["/photos/og-cover.jpg"],
  },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
