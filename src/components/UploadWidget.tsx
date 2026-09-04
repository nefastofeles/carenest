"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ExtractedKind } from "@/types";

export function UploadWidget({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [fileName, setFileName] = useState(
    memberId === "m_001" ? "marco_lipid_panel.pdf" : "health_record.pdf"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function extract(kind: ExtractedKind) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: memberId, filename: fileName, kind }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Extraction demo failed.");
      return;
    }
    router.push("/confirm-extraction");
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm">
        <span className="text-slate-600">File (demo accepts any name)</span>
        <input
          type="file"
          className="mt-1 block w-full text-sm"
          onChange={(e) => setFileName(e.target.files?.[0]?.name || fileName)}
        />
      </label>
      <p className="text-xs text-slate-500">
        Selected: {fileName}. Extraction is simulated. Document maps to a lab on file for Marco
        (l_0007). Medication maps to a prescription already on this member&apos;s profile.
        Nothing is saved until you confirm. No LLM call.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => extract("lab")} disabled={busy}>
          {busy ? "Extracting…" : "Extract document"}
        </Button>
        <Button variant="outline" onClick={() => extract("medication")} disabled={busy}>
          Extract medication
        </Button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
