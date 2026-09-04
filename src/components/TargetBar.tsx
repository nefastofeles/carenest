import { SCORE_GRADIENT_STOPS } from "@/utils/scoreColor";

export function TargetBar({
  id,
  label,
  value,
  target,
  displayValue,
  displayTarget,
  note,
  max,
}: {
  id: string;
  label: string;
  value: number;
  target: number;
  displayValue: string;
  displayTarget: string;
  note: string;
  max: number;
}) {
  const cap = Math.max(max, value, target, 1);
  const valuePct = Math.min(100, (value / cap) * 100);
  const targetPct = Math.min(100, (target / cap) * 100);
  const gid = `bar-grad-${id}`;

  return (
    <div className="rounded-2xl bg-white p-3.5 shadow-sm shadow-nest-peach/30 ring-1 ring-nest-peach/70">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-sm font-semibold tabular-nums text-slate-800">
          {displayValue}
          <span className="ml-1 text-[11px] font-normal text-slate-400">/ {displayTarget}</span>
        </p>
      </div>
      <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-nest-peach/40">
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
              {SCORE_GRADIENT_STOPS.map((s) => (
                <stop key={s.offset} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
          </defs>
          <rect
            x="0"
            y="0"
            width={`${valuePct}%`}
            height="100%"
            rx="6"
            fill={`url(#${gid})`}
          />
        </svg>
        <div
          className="absolute top-1/2 z-10 h-4 w-0.5 -translate-y-1/2 rounded-full bg-slate-800/80"
          style={{ left: `${targetPct}%` }}
          title={`Target ${displayTarget}`}
        />
      </div>
      <p className="mt-2 text-[10px] leading-snug text-slate-400">{note}</p>
    </div>
  );
}
