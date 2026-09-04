/** Map CareNest index 50 → red, 75 → amber, 100 → green. */
export function scoreHue(score: number): number {
  const s = Math.min(100, Math.max(50, score));
  if (s <= 75) return ((s - 50) / 25) * 50;
  return 50 + ((s - 75) / 25) * 70;
}

export function scoreColor(score: number, sat = 78, light = 42): string {
  return `hsl(${scoreHue(score)} ${sat}% ${light}%)`;
}

export const SCORE_GRADIENT_STOPS = [
  { offset: "0%", color: "hsl(0 82% 46%)" },
  { offset: "50%", color: "hsl(48 92% 48%)" },
  { offset: "100%", color: "hsl(142 62% 36%)" },
];

/** Low is better: green at the left, red at the right. */
export const SCORE_GRADIENT_STOPS_REVERSED = [
  { offset: "0%", color: "hsl(142 62% 36%)" },
  { offset: "50%", color: "hsl(48 92% 48%)" },
  { offset: "100%", color: "hsl(0 82% 46%)" },
];
