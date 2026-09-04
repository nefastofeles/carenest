import { NextResponse } from "next/server";
import { confirmExtraction } from "@/utils/extraction";
import { confirmSchema } from "@/utils/validation";

export async function POST(req: Request) {
  const parsed = confirmSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const record = confirmExtraction(parsed.data);
    return NextResponse.json({ ok: true, record });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Confirmation failed" },
      { status: 400 }
    );
  }
}
