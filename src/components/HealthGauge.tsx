import { SCORE_GRADIENT_STOPS, scoreColor } from "@/utils/scoreColor";

type Props = {
  score: number | null;
  size?: "sm" | "lg";
  gradientId?: string;
};

function clampDisplay(score: number): number {
  return Math.min(100, Math.max(50, score));
}

export function HealthGauge({ score, size = "sm", gradientId = "cr-gauge" }: Props) {
  const clamped = score == null ? null : clampDisplay(score);
  const t = clamped == null ? 0 : (clamped - 50) / 50;
  const color = score == null ? "#64748b" : scoreColor(score);
  const radius = 48;
  const circumference = Math.PI * radius;
  const dash = circumference * t;
  const wide = size === "lg";

  return (
    <div className={wide ? "flex w-44 shrink-0 flex-col items-center" : "flex w-[8.5rem] shrink-0 flex-col items-center"}>
      <svg
        viewBox="0 0 120 78"
        className={wide ? "h-[5.75rem] w-44" : "h-16 w-[8.5rem]"}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="12" y1="60" x2="108" y2="60" gradientUnits="userSpaceOnUse">
            {SCORE_GRADIENT_STOPS.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
          <filter id={`${gradientId}-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 12 62 A 48 48 0 0 1 108 62"
          fill="none"
          stroke="#f0e4d8"
          strokeWidth={wide ? 11 : 10}
          strokeLinecap="round"
        />
        {clamped != null && (
          <path
            d="M 12 62 A 48 48 0 0 1 108 62"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={wide ? 11 : 10}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            filter={`url(#${gradientId}-soft)`}
          />
        )}
      </svg>
      <p
        className={wide ? "text-4xl font-semibold leading-none tracking-tight" : "text-2xl font-semibold leading-none tracking-tight"}
        style={{ color }}
      >
        {score ?? "—"}
      </p>
      <p className="mt-1 text-center text-[9px] leading-tight text-slate-400">
        Not a medical diagnosis
      </p>
    </div>
  );
}
