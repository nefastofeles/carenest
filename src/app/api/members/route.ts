import { NextResponse } from "next/server";
import { allMemberSummaries } from "@/utils/data";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(allMemberSummaries());
}
