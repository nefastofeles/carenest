import { NextResponse } from "next/server";
import { getMember } from "@/utils/data";
import { connectedDevicesFor } from "@/utils/health";

export const dynamic = "force-dynamic";

export function GET(_req: Request, { params }: { params: { member_id: string } }) {
  if (!getMember(params.member_id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const connected = connectedDevicesFor(params.member_id);
  return NextResponse.json({
    connected: connected.length > 0,
    connected_devices: connected,
    member_id: params.member_id,
  });
}
