import { NextResponse } from "next/server";
import { careLoopsForMember } from "@/utils/careloops";
import { getMember } from "@/utils/data";

export const dynamic = "force-dynamic";

export function GET(_req: Request, { params }: { params: { member_id: string } }) {
  if (!getMember(params.member_id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ incomplete_actions: careLoopsForMember(params.member_id) });
}
