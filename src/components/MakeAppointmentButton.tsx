"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MakeAppointmentButton() {
  const [note, setNote] = useState<string | null>(null);
  return (
    <div className="mt-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          setNote("Make appointment is a demo control. CareNest does not book appointments.")
        }
      >
        Make appointment
      </Button>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  );
}
