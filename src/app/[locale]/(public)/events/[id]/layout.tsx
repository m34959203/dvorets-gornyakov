import type { Metadata } from "next";
import { isValidLocale, type Locale, getLocalizedField } from "@/lib/i18n";
import { getOne } from "@/lib/db";
import { eventImage } from "@/lib/event-image";

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
  event_type: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadEventMeta(id: string): Promise<EventRow | null> {
  if (!UUID_RE.test(id)) return null;
  try {
    return await getOne<EventRow>(
      `SELECT id, title_kk, title_ru, description_kk, description_ru, image_url, event_type
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
      title: locale === "kk" ? "Іс-шара" : "Событие",
      alternates: { canonical, languages },
    };
  }

  const title = getLocalizedField(row, "title", locale);
  const description = getLocalizedField(row, "description", locale);
  // Per-event og:image: фото события или фолбэк по типу (не пустой массив,
  // иначе перебивает корневой og:image пустотой).
  const images = [eventImage(row.image_url, row.event_type)];
  return {
    title,
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
