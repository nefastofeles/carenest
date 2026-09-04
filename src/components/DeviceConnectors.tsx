"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DEVICE_CATALOG } from "@/utils/health";
import type { DeviceKind } from "@/types";

export function DeviceConnectors({ memberId }: { memberId: string }) {
  const [connected, setConnected] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/device/${memberId}`);
    const body = await res.json();
    setConnected(body.connected_devices ?? []);
  }

  useEffect(() => {
    load();
  }, [memberId]);

  async function connect(device: DeviceKind) {
    setBusy(device);
    await fetch("/api/device/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: memberId, device }),
    });
    await load();
    setBusy(null);
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {DEVICE_CATALOG.map((d) => {
        const on = connected.includes(d.id);
        return (
          <Button
            key={d.id}
            variant={on ? "secondary" : "outline"}
            disabled={on || busy === d.id}
            onClick={() => connect(d.id)}
          >
            {on ? `${d.label} · connected` : d.label}
          </Button>
        );
      })}
    </div>
  );
}
