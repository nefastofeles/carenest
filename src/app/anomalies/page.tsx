import Link from "next/link";
import { AnomalyBadge } from "@/components/AnomalyBadge";
import { Card, CardContent } from "@/components/ui/card";
import { getAnomalies, getMember } from "@/utils/data";
import { getDataset } from "@/utils/store";

export const dynamic = "force-dynamic";

function ownerOf(recordId: string): string | null {
  const d = getDataset();
  const hit =
    d.doctor_visits.find((v) => v.visit_id === recordId) ||
    d.dental_visits.find((v) => v.visit_id === recordId) ||
    d.lab_results.find((l) => l.lab_id === recordId) ||
    d.vaccinations.find((v) => v.vaccination_id === recordId) ||
    d.device_monthly.find((v) => v.id === recordId);
  return hit ? hit.member_id : null;
}

export default function AnomaliesPage({
  searchParams,
}: {
  searchParams: { member?: string; record?: string };
}) {
  const anomalies = getAnomalies(searchParams.member);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Seeded anomalies</h1>
      <p className="text-sm text-slate-600">
        Six known data issues from the synthetic set. Needs Review is a record flag, not a
        diagnosis.
      </p>
      <div className="space-y-3">
        {anomalies.map((a) => {
          const ownerId = ownerOf(a.record_id);
          const owner = ownerId ? getMember(ownerId) : null;
          const highlight = searchParams.record === a.record_id;
          return (
            <Card
              key={a.id}
              className={highlight ? "border-amber-500" : undefined}
              id={a.record_id}
            >
              <CardContent className="space-y-2 pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <AnomalyBadge />
                  <span className="text-xs uppercase text-slate-400">{a.type}</span>
                  {owner && (
                    <Link href={`/members/${owner.id}`} className="text-xs text-nest-magenta underline">
                      {owner.display_name}
                    </Link>
                  )}
                </div>
                <p className="text-sm text-slate-800">{a.description}</p>
                <p className="text-xs text-slate-500">
                  {a.table} / {a.record_id}
                  {a.related_record_ids?.length
                    ? ` (related: ${a.related_record_ids.join(", ")})`
                    : ""}
                </p>
                {owner && (
                  <Link
                    href={`/members/${owner.id}`}
                    className="text-xs font-medium text-nest-magenta underline"
                  >
                    Open {owner.display_name}&apos;s timeline
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
