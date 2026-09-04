import Link from "next/link";
import { notFound } from "next/navigation";
import { DoctorBriefView } from "@/components/DoctorBrief";
import { PrintButton } from "@/components/PrintButton";
import { doctorBrief } from "@/utils/brief";

export const dynamic = "force-dynamic";

export default function DoctorBriefPage({ params }: { params: { member_id: string } }) {
  const brief = doctorBrief(params.member_id);
  if (!brief) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <p className="text-xs text-slate-500">
            <Link href={`/members/${brief.member.id}`} className="hover:underline">
              {brief.member.display_name}
            </Link>{" "}
            / Doctor brief
          </p>
          <h1 className="text-2xl font-semibold">Prepare appointment</h1>
        </div>
        <PrintButton />
      </div>
      <DoctorBriefView brief={brief} />
    </div>
  );
}
