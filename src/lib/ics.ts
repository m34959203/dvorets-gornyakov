// Генерация .ics (iCalendar) для кнопки «Добавить в календарь».

function toIcsUtc(iso: string): string {
  // YYYYMMDDTHHMMSSZ в UTC
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildEventIcs(opts: {
  uid: string;
  title: string;
  start: string;
  end?: string | null;
  location?: string;
  description?: string;
  url?: string;
}): string {
  // Без end — по умолчанию +2 часа
  const end = opts.end || new Date(new Date(opts.start).getTime() + 2 * 3600_000).toISOString();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dvorets Gornyakov//Events//RU",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@dvorets-gornyakov`,
    `DTSTAMP:${toIcsUtc(new Date().toISOString())}`,
    `DTSTART:${toIcsUtc(opts.start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcs(opts.title)}`,
    opts.location ? `LOCATION:${escapeIcs(opts.location)}` : "",
    opts.description ? `DESCRIPTION:${escapeIcs(opts.description)}` : "",
    opts.url ? `URL:${opts.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

/** data:-URI для <a download> (без отдельного route). */
export function icsDataUri(ics: string): string {
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
}
