import { NextResponse } from "next/server";
import { dismissCareLoop } from "@/utils/careloops";
import { dismissSchema } from "@/utils/validation";

export async function POST(req: Request) {
  const parsed = dismissSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  dismissCareLoop(parsed.data.loop_id);
  return NextResponse.json({ ok: true });
}
