import { cn } from "@/lib/utils";

export function AnomalyBadge({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200",
        className
      )}
    >
      <span aria-hidden>!</span>
      {compact ? "Review" : "Needs Review"}
    </span>
  );
}
