import type { Metadata } from "next";
import { getSiteBaseUrl } from "@/lib/site-url";
import { isValidLocale, type Locale } from "@/lib/i18n";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: lp } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  // Короткий титл — site name добавит template из (public)/layout.tsx (иначе тройной дубль)
  const title = locale === "kk" ? "Үйірмелер мен студиялар" : "Кружки и студии";
  const description =
    locale === "kk"
      ? "Балалар мен ересектерге арналған 20-дан астам шығармашылық үйірме: вокал, би, театр, өнер, музыка, қолөнер."
      : "Более 20 творческих кружков для детей и взрослых: вокал, танцы, театр, искусство, музыка, рукоделие.";
  const baseUrl = await getSiteBaseUrl();
  const canonical = `${baseUrl}/${locale}/clubs`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: "/photos/og-cover.jpg", width: 1200, height: 630 }],
    },
    alternates: {
      canonical,
      languages: {
        kk: `${baseUrl}/kk/clubs`,
        ru: `${baseUrl}/ru/clubs`,
      },
    },
  };
}

export default function ClubsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
