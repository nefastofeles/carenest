import { NextResponse } from "next/server";
import { getMember } from "@/utils/data";
import { getTimeline } from "@/utils/timeline";

export const dynamic = "force-dynamic";

export function GET(req: Request, { params }: { params: { member_id: string } }) {
  if (!getMember(params.member_id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const url = new URL(req.url);
  const events = getTimeline(params.member_id, {
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  });
  return NextResponse.json(events);
}
