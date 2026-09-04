"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GuidanceDecision, GuidanceItem } from "@/types";

export function GuidanceNotification({
  item,
  decision,
}: {
  item: GuidanceItem;
  decision?: GuidanceDecision;
}) {
  const [reason, setReason] = useState("");
  const [current, setCurrent] = useState(decision);
  const [error, setError] = useState<string | null>(null);

  async function choose(action: GuidanceDecision["action"]) {
    if (action === "dismiss" && !reason.trim()) {
      setError("A reason is required to dismiss.");
      return;
    }
    setError(null);
    const res = await fetch("/api/guidance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guidance_id: item.id,
        action,
        reason: reason.trim() || undefined,
      }),
    });
    if (!res.ok) {
      setError("Could not save this choice.");
      return;
    }
    const body = await res.json();
    setCurrent(body.decision);
  }

  return (
    <Card>
      <CardHeader>
        {item.demo && (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
            Demo notification — not a personal medical instruction
          </p>
        )}
        <CardTitle>Official programme notice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-800">{item.message}</p>
        <dl className="grid gap-1 text-xs text-slate-600">
          <div>
            <span className="text-slate-400">Source: </span>
            {item.authority}
          </div>
          <div>
            <span className="text-slate-400">Country: </span>
            {item.country}
          </div>
          <div>
            <span className="text-slate-400">Date: </span>
            {item.date}
          </div>
          <div>
            <span className="text-slate-400">Official link: </span>
            <a
              href={item.link_to_official}
              target="_blank"
              rel="noreferrer"
              className="text-nest-magenta underline"
            >
              {item.link_to_official}
            </a>
          </div>
        </dl>
        {current ? (
          <p className="text-sm text-nest-magentadark">
            Recorded: {current.action.replace(/_/g, " ")}
            {current.reason ? ` — ${current.reason}` : ""}
          </p>
        ) : (
          <>
            <label className="block text-xs text-slate-500">
              Dismiss reason (required only if dismissing)
              <textarea
                className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            {error && <p className="text-xs text-red-700">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => choose("confirm")}>
                Yes, confirm
              </Button>
              <Button size="sm" variant="outline" onClick={() => choose("discuss_with_doctor")}>
                Discuss with doctor
              </Button>
              <Button size="sm" variant="danger" onClick={() => choose("dismiss")}>
                Dismiss with reason
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
