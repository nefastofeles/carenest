"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DeviceConnectors } from "@/components/DeviceConnectors";

const MEMBERS = [
  { id: "m_001", name: "Marco" },
  { id: "m_002", name: "Sofie" },
  { id: "m_003", name: "Lukas" },
  { id: "m_004", name: "Emma" },
];

function ConnectInner() {
  const params = useSearchParams();
  const memberId = params.get("member") || "";
  const selected = MEMBERS.find((m) => m.id === memberId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Devices</h1>
      <p className="text-sm text-slate-600">
        Simulated connectors only. Prefer connecting from a member page.
      </p>
      <div className="flex flex-wrap gap-2">
        {MEMBERS.map((m) => (
          <Link
            key={m.id}
            href={`/connect-device?member=${m.id}`}
            className={`rounded-full px-3 py-1 text-sm ${
              memberId === m.id ? "bg-nest-magenta text-white" : "bg-white ring-1 ring-nest-peach"
            }`}
          >
            {m.name}
          </Link>
        ))}
      </div>
      {selected ? (
        <DeviceConnectors memberId={selected.id} />
      ) : (
        <p className="text-sm text-slate-500">Select a family member.</p>
      )}
    </div>
  );
}

export default function ConnectDevicePage() {
  return (
    <Suspense>
      <ConnectInner />
    </Suspense>
  );
}
