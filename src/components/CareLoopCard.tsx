"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CareLoopAction } from "@/types";

export function CareLoopCard({
  action,
  memberId,
}: {
  action: CareLoopAction;
  memberId: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onAction(option: string) {
    if (option === "Dismiss") {
      setBusy(true);
      await fetch("/api/care-loops/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loop_id: action.id }),
      });
      setBusy(false);
      router.refresh();
      return;
    }
    if (option === "Ask doctor") {
      router.push(`/doctor-brief/${memberId}`);
      return;
    }
    setNote(
      `${option} is a demo control. CareNest does not book tests or appointments.`
    );
  }

  return (
    <Card className={action.is_demo_seed ? "border-nest-magenta/50" : undefined}>
      <CardHeader>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-nest-magenta">
          {action.type.replace(/_/g, " ")}
        </p>
        <CardTitle className="uppercase">{action.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-700">{action.detail}</p>
        <dl className="grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div>
            <dt className="text-slate-400">Due</dt>
            <dd>
              {action.due_date ?? "No record found"}
              {action.days_until_due !== null && (
                <span className="ml-1">
                  ({action.days_until_due >= 0
                    ? `${action.days_until_due} days`
                    : `${Math.abs(action.days_until_due)} days past`})
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Status</dt>
            <dd className="capitalize">{action.status}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-slate-400">Source record</dt>
            <dd>
              {action.table} / {action.record_id}
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          {action.action_options.map((opt) => (
            <Button
              key={opt}
              size="sm"
              variant={opt === "Dismiss" ? "danger" : opt === "Ask doctor" ? "default" : "outline"}
              disabled={busy}
              onClick={() => onAction(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>
        {note && <p className="text-xs text-slate-500">{note}</p>}
      </CardContent>
    </Card>
  );
}
