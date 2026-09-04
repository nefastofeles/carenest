import Link from "next/link";
import { familyCalendarEvents, MEMBER_CALENDAR_COLOR } from "@/utils/health";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function daysInMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function mondayOffset(year: number, monthIndex: number) {
  const dow = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  return (dow + 6) % 7;
}

export default function CalendarPage() {
  const year = 2026;
  const events = familyCalendarEvents(year);
  const byDate = new Map<string, typeof events>();
  for (const e of events) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="mt-1 text-sm text-slate-600">
          Jensen Smith Family · {year}. Past and upcoming visits on file.
        </p>
      </div>

      <ul className="flex flex-wrap gap-3 text-xs">
        {Object.entries(MEMBER_CALENDAR_COLOR).map(([id, c]) => (
          <li key={id} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", c.dot)} />
            <span className={c.text}>{c.label}</span>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {MONTHS.map((label, monthIndex) => {
          const dim = daysInMonth(year, monthIndex);
          const offset = mondayOffset(year, monthIndex);
          const cells: (number | null)[] = [
            ...Array(offset).fill(null),
            ...Array.from({ length: dim }, (_, i) => i + 1),
          ];
          while (cells.length % 7 !== 0) cells.push(null);

          return (
            <section key={label} className="rounded-2xl bg-white p-3 shadow-sm shadow-nest-peach/30 ring-1 ring-nest-peach/70">
              <h2 className="mb-2 text-sm font-semibold">{label}</h2>
              <div className="grid grid-cols-7 gap-px text-[10px] text-slate-400">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="pb-1 text-center font-medium">
                    {d}
                  </div>
                ))}
                {cells.map((day, i) => {
                  const iso =
                    day == null
                      ? null
                      : `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayEvents = iso ? byDate.get(iso) ?? [] : [];
                  return (
                    <div
                      key={`${label}-${i}`}
                      className="min-h-[3.25rem] rounded-md bg-nest-cream/80 p-0.5"
                    >
                      {day != null && (
                        <p className="text-right text-[10px] text-slate-500">{day}</p>
                      )}
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map((e) => {
                          const color = MEMBER_CALENDAR_COLOR[e.member_id];
                          return (
                            <Link
                              key={e.id}
                              href={`/members/${e.member_id}`}
                              className={cn(
                                "block truncate rounded px-0.5 py-px leading-tight",
                                color?.bg,
                                color?.text
                              )}
                              title={`${e.member_name}: ${e.title}`}
                            >
                              {e.member_name.slice(0, 1)} {e.title}
                            </Link>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <p className="text-[9px] text-slate-400">+{dayEvents.length - 3}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
