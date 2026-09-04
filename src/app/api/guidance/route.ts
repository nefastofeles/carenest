import { NextResponse } from "next/server";
import { getDataset, getStore } from "@/utils/store";
import { guidanceDecisionSchema } from "@/utils/validation";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    items: getDataset().guidance,
    decisions: getStore().guidanceDecisions,
  });
}

export async function POST(req: Request) {
  const parsed = guidanceDecisionSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const store = getStore();
  store.guidanceDecisions = store.guidanceDecisions.filter(
    (d) => d.guidance_id !== parsed.data.guidance_id
  );
  store.guidanceDecisions.push(parsed.data);
  return NextResponse.json({ decision: parsed.data });
}
