import Link from "next/link";
import type { Locale } from "@/lib/i18n";

interface Props {
  locale: Locale;
  from?: string; // YYYY-MM-DD
  to?: string;
  today?: string;
}

const DOW_RU = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const DOW_KK = ["жс", "дс", "сс", "ср", "бс", "жм", "сб"];
const MONTHS_RU = ["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"];
const MONTHS_KK = ["қаңтар","ақпан","наурыз","сәуір","мамыр","маусым","шілде","тамыз","қыркүйек","қазан","қараша","желтоқсан"];

function parse(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarStrip({
  locale,
  from = "2026-04-20",
  to = "2026-05-15",
  today = "2026-04-20",
}: Props) {
  const start = parse(from);
  const end = parse(to);
  const todayD = parse(today);

  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const dow = locale === "kk" ? DOW_KK : DOW_RU;
  const months = locale === "kk" ? MONTHS_KK : MONTHS_RU;

  let lastMonth = -1;

  return (
    <section className="py-10 bg-white border-y border-[color:var(--line)]">
      <div className="max-w-[1240px] mx-auto px-7">
        <div className="flex items-center justify-between mb-5 gap-4">
          <h3
            className="text-[22px] font-semibold leading-tight"
            style={{ fontFamily: "var(--font-head)", color: "var(--navy)" }}
          >
            {locale === "kk" ? "Күнтізбе" : "Календарь событий"}
          </h3>
          <Link
            href={`/${locale}/events`}
            className="text-[13px] font-semibold text-[color:var(--navy)] border-b-[1.5px] border-[color:var(--ochre)] hover:text-[color:var(--coral-600)] hover:border-[color:var(--coral-600)]"
          >
            {locale === "kk" ? "Толық афиша →" : "Полная афиша →"}
          </Link>
        </div>

        <div className="overflow-x-auto -mx-2 pb-2">
          <div className="flex items-stretch gap-1 px-2 min-w-max">
            {days.map((d, i) => {
              const m = d.getMonth();
              const isNewMonth = m !== lastMonth;
              lastMonth = m;
              const isToday = iso(d) === iso(todayD);
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;

              return (
                <div key={i} className="flex items-stretch">
                  {isNewMonth && (
                    <div
                      className="flex items-end px-3 mr-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ochre-600)] border-l-[2px] border-[color:var(--ochre)] pb-1"
                      style={{ fontFamily: "var(--font-head)" }}
                    >
                      {months[m]}
                    </div>
                  )}
                  <Link
                    href={`/${locale}/events?date=${iso(d)}`}
                    className={
                      "flex flex-col items-center justify-center rounded-lg px-3 py-2 w-[52px] text-center transition " +
                      (isToday
                        ? "bg-[color:var(--navy)] text-white shadow-md"
                        : isWeekend
                          ? "bg-[color:var(--cream)] text-[color:var(--ink-2)] hover:bg-[color:var(--ochre-soft)]/30"
                          : "bg-white text-[color:var(--navy)] hover:bg-[color:var(--cream)] border border-transparent hover:border-[color:var(--line)]")
                    }
                  >
                    <span className={"text-[10px] uppercase tracking-wider " + (isToday ? "text-white/80" : "text-[color:var(--ink-2)]")}>
                      {dow[d.getDay()]}
                    </span>
                    <span className="text-[18px] font-semibold leading-none mt-1" style={{ fontFamily: "var(--font-head)" }}>
                      {d.getDate()}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
