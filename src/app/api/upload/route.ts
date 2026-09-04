import { NextResponse } from "next/server";
import { simulateExtraction } from "@/utils/extraction";
import { getStore } from "@/utils/store";
import { uploadSchema } from "@/utils/validation";

export const dynamic = "force-dynamic";

export function GET() {
  const pending = getStore().pendingExtraction;
  if (!pending) return NextResponse.json({ extracted_data: null });
  return NextResponse.json({
    extracted_data: simulateExtraction(pending.member_id, pending.kind),
    requires_confirmation: true,
  });
}

export async function POST(req: Request) {
  const parsed = uploadSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const extracted = simulateExtraction(
    parsed.data.member_id,
    parsed.data.kind === "medication" ? "medication" : "lab"
  );
  return NextResponse.json({
    extracted_data: extracted,
    confidence: extracted.confidence,
    requires_confirmation: true,
  });
}
