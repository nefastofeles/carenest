import { NextResponse } from "next/server";
import { doctorBrief } from "@/utils/brief";

export const dynamic = "force-dynamic";

export function GET(_req: Request, { params }: { params: { member_id: string } }) {
  const brief = doctorBrief(params.member_id);
  if (!brief) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...brief,
    pdf_url: `/doctor-brief/${params.member_id}`,
  });
}
