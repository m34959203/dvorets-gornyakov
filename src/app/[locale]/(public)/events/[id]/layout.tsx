import type { Metadata } from "next";
import { isValidLocale, type Locale, getLocalizedField } from "@/lib/i18n";
import { getOne } from "@/lib/db";

const SITE_NAME_KK = "Ш. Ділдебаев атындағы тау-кенші сарайы";
const SITE_NAME_RU = "Дворец горняков им. Ш. Дільдебаева";

function getBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  const fallback = env || "https://dvorets-gornyakov.kz";
  return fallback.replace(/\/$/, "");
}

type EventRow = {
  id: string;
  title_kk: string;
  title_ru: string;
  description_kk: string | null;
  description_ru: string | null;
  image_url: string | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadEventMeta(id: string): Promise<EventRow | null> {
  if (!UUID_RE.test(id)) return null;
  try {
    return await getOne<EventRow>(
      `SELECT id, title_kk, title_ru, description_kk, description_ru, image_url
         FROM events WHERE id = $1`,
      [id]
    );
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: lp, id } = await params;
  const locale: Locale = isValidLocale(lp) ? lp : "kk";
  const row = await loadEventMeta(id);

  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/${locale}/events/${id}`;
  const languages = {
    kk: `${baseUrl}/kk/events/${id}`,
    ru: `${baseUrl}/ru/events/${id}`,
  };

  if (!row) {
    return {
      title: `${locale === "kk" ? "Іс-шара" : "Событие"} — ${locale === "kk" ? SITE_NAME_KK : SITE_NAME_RU}`,
      alternates: { canonical, languages },
    };
  }

  const title = getLocalizedField(row, "title", locale);
  const description = getLocalizedField(row, "description", locale);
  const images = row.image_url ? [row.image_url] : [];
  return {
    title: `${title} — ${locale === "kk" ? SITE_NAME_KK : SITE_NAME_RU}`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images,
    },
    alternates: {
      canonical,
      languages,
    },
  };
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return children;
}
