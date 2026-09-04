import { NextResponse } from "next/server";
import { getMemberRecord } from "@/utils/data";

export const dynamic = "force-dynamic";

export function GET(_req: Request, { params }: { params: { id: string } }) {
  const record = getMemberRecord(params.id);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(record);
}
