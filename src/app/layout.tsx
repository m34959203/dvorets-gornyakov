import type { Metadata } from "next";
import "./globals.css";

const SITE_TITLE = "Дворец горняков им. Ш. Дильдебаева — Сатпаев";
const SITE_DESC =
  "КГКП «Центр культуры и творчества им. Ш. Дильдебаева» (Дворец горняков) — культурный центр города Сатпаев, область Ұлытау. 22 коллектива, 3 зала, афиша концертов и событий.";
// metadataBase нужен, чтобы относительный og:image развернулся в абсолютный URL.
// При смене домена/туннеля задаётся через NEXT_PUBLIC_APP_URL на этапе сборки.
const BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://dvorets-gornyakov.kz"
).replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · Дворец горняков · Сатпаев",
  },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
