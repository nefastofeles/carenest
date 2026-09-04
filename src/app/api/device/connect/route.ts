import { NextResponse } from "next/server";
import { deviceKey } from "@/utils/health";
import { getStore } from "@/utils/store";
import { connectDeviceSchema } from "@/utils/validation";

export async function POST(req: Request) {
  const parsed = connectDeviceSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  getStore().connectedDevices.add(deviceKey(parsed.data.member_id, parsed.data.device));
  return NextResponse.json({
    connected: true,
    member_id: parsed.data.member_id,
    device: parsed.data.device,
  });
}
