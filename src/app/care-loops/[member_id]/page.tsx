import Link from "next/link";
import { notFound } from "next/navigation";
import { CareLoopCard } from "@/components/CareLoopCard";
import { careLoopsForMember } from "@/utils/careloops";
import { getMember } from "@/utils/data";

export const dynamic = "force-dynamic";

export default function CareLoopsPage({ params }: { params: { member_id: string } }) {
  const member = getMember(params.member_id);
  if (!member) notFound();
  const loops = careLoopsForMember(member.id);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        <Link href={`/members/${member.id}`} className="hover:underline">
          {member.display_name}
        </Link>{" "}
        / Care loops
      </p>
      <h1 className="text-2xl font-semibold">Open actions · {member.display_name}</h1>
      <p className="text-sm text-slate-600">
        CareNest lists missing or overdue items from the record. It does not book tests or
        judge adherence.
      </p>
      {loops.length === 0 ? (
        <p className="text-sm text-slate-500">No record found for open care loops.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {loops.map((loop) => (
            <CareLoopCard key={loop.id} action={loop} memberId={member.id} />
          ))}
        </div>
      )}
    </div>
  );
}
