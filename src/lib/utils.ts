import { type Locale } from "./i18n";

/** Часовой пояс учреждения. Контейнер живёт в UTC, поэтому все «гражданские»
 *  компоненты дат событий нужно извлекать в этом поясе, иначе вечерние события
 *  показывают чужой день и время «04:00». */
export const TIMEZONE = "Asia/Almaty";

const WEEKDAY_MON0: Record<string, number> = {
  Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
};

/** Компоненты даты в Asia/Almaty: day, month (0-indexed), year, weekday (0=Пн), hour, minute. */
export function almatyParts(date: string | Date): {
  day: number;
  month: number;
  year: number;
  weekday: number;
  hour: number;
  minute: number;
} {
  const d = typeof date === "string" ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    day: Number(get("day")),
    month: Number(get("month")) - 1,
    year: Number(get("year")),
    weekday: WEEKDAY_MON0[get("weekday")] ?? 0,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export function formatDate(date: string | Date, locale: Locale): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const loc = locale === "kk" ? "kk-KZ" : "ru-RU";
  return d.toLocaleDateString(loc, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date, locale: Locale): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const loc = locale === "kk" ? "kk-KZ" : "ru-RU";
  return d.toLocaleDateString(loc, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

export function cn(...classes: (string | boolean | undefined | null | number)[]): string {
  return classes.filter((c) => typeof c === "string" && c).join(" ");
}

export function getEventTypeColor(type: string): string {
  const colors: Record<string, string> = {
    concert: "bg-purple-500",
    exhibition: "bg-blue-500",
    workshop: "bg-green-500",
    festival: "bg-orange-500",
    competition: "bg-red-500",
    other: "bg-gray-500",
  };
  return colors[type] || colors.other;
}

export function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    published: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
    archived: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    upcoming: "bg-blue-100 text-blue-800",
    ongoing: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function paginate(page: number, pageSize: number): { limit: number; offset: number } {
  const p = Math.max(1, page);
  return { limit: pageSize, offset: (p - 1) * pageSize };
}

export function apiError(message: string, status: number = 400): Response {
  return Response.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status: number = 200): Response {
  return Response.json({ data }, { status });
}
