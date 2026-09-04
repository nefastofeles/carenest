"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExtractedDocument } from "@/types";

export default function ConfirmExtractionPage() {
  const router = useRouter();
  const [data, setData] = useState<ExtractedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/upload")
      .then((r) => r.json())
      .then((body) => {
        if (body.extracted_data) setData(body.extracted_data);
        else setError("No pending extraction. Start from Upload.");
      });
  }, []);

  async function confirm() {
    if (!data) return;
    const res = await fetch("/api/confirm-extraction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: data.kind,
        lab_id: data.lab_id,
        medication_id: data.medication_id,
        member_id: data.member_id,
      }),
    });
    if (!res.ok) {
      setError("Confirmation failed.");
      return;
    }
    router.push(`/members/${data.member_id}`);
  }

  if (error && !data) {
    return (
      <p className="text-sm text-slate-600">
        {error}{" "}
        <Link href="/members/m_001" className="underline">
          Back to member
        </Link>
      </p>
    );
  }
  if (!data) return <p className="text-sm text-slate-500">Loading extracted fields…</p>;

  const fields = [
    ["Kind", data.kind === "medication" ? "Medication" : "Document / lab"],
    ["Member name", data.member_name],
    ["Record name", data.test_name],
    ["Date", data.date],
    ["Result / finding", data.result],
    ["Doctor instruction / follow-up", data.doctor_instruction],
    ["Source document", data.source_document],
    ["Confidence (simulated)", `${Math.round(data.confidence * 100)}%`],
  ];

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Confirm extraction</h1>
      <p className="text-sm text-slate-600">
        Step 2 of 2. Fields are read-only. Confirm to link this document to the file.
        CareNest will not auto-save.
        {data.kind === "medication"
          ? " Medication confirm does not change dose."
          : ""}
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Extracted fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map(([k, v]) => (
            <div key={k}>
              <p className="text-xs uppercase text-slate-400">{k}</p>
              <p className="text-sm text-slate-800">{v}</p>
            </div>
          ))}
          <p className="text-xs text-slate-500">From {data.source_document}</p>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={confirm}>
              {data.kind === "medication"
                ? "Confirm medication record"
                : "Confirm and add to timeline"}
            </Button>
            <Link href={`/members/${data.member_id}`}>
              <Button variant="outline">Back</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
