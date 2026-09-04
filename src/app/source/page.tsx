import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDataset } from "@/utils/store";

export const dynamic = "force-dynamic";

function lookupRecord(path: string, recordId?: string) {
  const d = getDataset();
  if (recordId) {
    const visit = d.doctor_visits.find((v) => v.visit_id === recordId);
    if (visit) {
      return {
        table: "doctor_visits",
        id: visit.visit_id,
        title: visit.topic,
        member_id: visit.member_id,
        date: visit.date,
        source_document: visit.source_document,
      };
    }
    const dental = d.dental_visits.find((v) => v.visit_id === recordId);
    if (dental) {
      return {
        table: "dental_visits",
        id: dental.visit_id,
        title: dental.topic,
        member_id: dental.member_id,
        date: dental.date,
        source_document: dental.source_document,
      };
    }
    const lab = d.lab_results.find((l) => l.lab_id === recordId);
    if (lab) {
      return {
        table: "lab_results",
        id: lab.lab_id,
        title: lab.test_name,
        member_id: lab.member_id,
        date: lab.date,
        source_document: lab.source_document,
      };
    }
    const vax = d.vaccinations.find((v) => v.vaccination_id === recordId);
    if (vax) {
      return {
        table: "vaccinations",
        id: vax.vaccination_id,
        title: vax.vaccine_name,
        member_id: vax.member_id,
        date: vax.date,
        source_document: vax.source_document,
      };
    }
  }
  const byPath = [
    ...d.doctor_visits.map((v) => ({
      table: "doctor_visits",
      id: v.visit_id,
      title: v.topic,
      member_id: v.member_id,
      date: v.date,
      source_document: v.source_document,
    })),
    ...d.dental_visits.map((v) => ({
      table: "dental_visits",
      id: v.visit_id,
      title: v.topic,
      member_id: v.member_id,
      date: v.date,
      source_document: v.source_document,
    })),
    ...d.lab_results.map((l) => ({
      table: "lab_results",
      id: l.lab_id,
      title: l.test_name,
      member_id: l.member_id,
      date: l.date,
      source_document: l.source_document,
    })),
    ...d.vaccinations.map((v) => ({
      table: "vaccinations",
      id: v.vaccination_id,
      title: v.vaccine_name,
      member_id: v.member_id,
      date: v.date,
      source_document: v.source_document,
    })),
  ].find((r) => r.source_document === path);
  return byPath ?? null;
}

export default function SourcePage({
  searchParams,
}: {
  searchParams: { path?: string; record?: string };
}) {
  const path = searchParams.path || "";
  const safe = path.startsWith("sources/") && !path.includes("..");
  const hit = safe ? lookupRecord(path, searchParams.record) : null;
  const member = hit
    ? getDataset().members.find((m) => m.id === hit.member_id)
    : undefined;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <p className="text-xs text-slate-500">
        <Link href={hit ? `/members/${hit.member_id}` : "/"} className="hover:underline">
          Back
        </Link>
      </p>
      <h1 className="text-2xl font-semibold">Source document</h1>
      <Card>
        <CardHeader>
          <CardTitle>{hit?.title ?? "No record found"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-slate-600">
            Synthetic source stub. Not a real PDF. CareNest does not store clinical files in
            this demo.
          </p>
          {hit ? (
            <>
              <p>
                <span className="text-slate-400">Path </span>
                {hit.source_document}
              </p>
              <p>
                <span className="text-slate-400">Record </span>
                {hit.table} / {hit.id}
              </p>
              <p>
                <span className="text-slate-400">Member </span>
                {member?.display_name ?? hit.member_id}
              </p>
              <p>
                <span className="text-slate-400">Date </span>
                {hit.date}
              </p>
            </>
          ) : (
            <p className="text-slate-500">No source document on file for this path.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
