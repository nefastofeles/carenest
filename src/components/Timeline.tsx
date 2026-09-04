import Link from "next/link";
import { AnomalyBadge } from "@/components/AnomalyBadge";
import { TYPE_LABELS } from "@/utils/timeline";
import type { TimelineEvent, TimelineEventType } from "@/types";
import { cn } from "@/lib/utils";

const TYPE_COLOR: Record<TimelineEventType, string> = {
  doctor_visit: "bg-nest-magenta",
  dental_visit: "bg-slate-500",
  lab: "bg-amber-600",
  vaccination: "bg-emerald-700",
  device_event: "bg-violet-600",
  device_monthly: "bg-violet-400",
};

export function Timeline({
  events,
  memberId,
}: {
  events: TimelineEvent[];
  memberId: string;
}) {
  if (!events.length) {
    return <p className="text-sm text-slate-500">No record found for this filter.</p>;
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={`${event.type}-${event.id}`}>
          <article className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className={cn("mt-1 h-3 w-3 shrink-0 rounded-full", TYPE_COLOR[event.type])} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <time className="text-xs font-medium text-slate-500">{event.date}</time>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-slate-600">
                  {TYPE_LABELS[event.type]}
                </span>
                {event.flag && (
                  <Link href={`/anomalies?member=${memberId}&record=${event.id}`}>
                    <AnomalyBadge />
                  </Link>
                )}
              </div>
              <h3 className="mt-1 font-semibold capitalize text-slate-900">{event.title}</h3>
              {event.provider && (
                <p className="text-sm text-slate-600">{event.provider}</p>
              )}
              <p className="mt-1 text-sm text-slate-700">{event.summary || "No record found."}</p>
              <p
                className={cn(
                  "mt-2 text-xs",
                  event.type === "device_event" || event.type === "device_monthly"
                    ? "text-violet-800"
                    : "text-slate-500"
                )}
              >
                {event.source_label}
              </p>
              {event.source_document ? (
                <Link
                  href={`/source?path=${encodeURIComponent(event.source_document)}&record=${encodeURIComponent(event.id)}`}
                  className="mt-3 inline-flex h-8 items-center rounded-md border border-slate-300 bg-white px-3 text-xs font-medium hover:bg-slate-50"
                >
                  Document
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-3 inline-flex h-8 cursor-not-allowed items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-400"
                >
                  No source document on file
                </button>
              )}
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}
