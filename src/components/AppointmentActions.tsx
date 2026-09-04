"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AppointmentActions({ memberId }: { memberId: string }) {
  const [note, setNote] = useState<string | null>(null);

  return (
    <div className="mt-2 space-y-1">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setNote("Reschedule is a demo control. CareNest does not book appointments.")
          }
        >
          Reschedule
        </Button>
        <Link href={`/doctor-brief/${memberId}`}>
          <Button size="sm">Prepare appointment</Button>
        </Link>
      </div>
      {note && <p className="text-xs text-slate-500">{note}</p>}
    </div>
  );
}
