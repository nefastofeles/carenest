import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { HealthGauge } from "@/components/HealthGauge";
import { conditionChips } from "@/utils/health";
import type { MemberSummary } from "@/types";

const ROLE_LABEL: Record<string, string> = {
  father: "Father",
  mother: "Mother",
  son: "Son",
  daughter: "Daughter",
};

export function MemberCard({ member }: { member: MemberSummary }) {
  const chips = conditionChips(member.id);
  const donorYes = member.donor_profile.registered;

  return (
    <Link href={`/members/${member.id}`} className="block">
      <Card className="h-full transition hover:border-nest-magenta/40 hover:shadow-md">
        <CardContent className="flex items-start gap-3 pt-5">
          <Image
            src={member.avatar_url}
            alt=""
            width={72}
            height={72}
            className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-nest-ink">
              {member.display_name}, {member.age}
            </p>
            <p className="text-sm capitalize text-slate-500">
              {ROLE_LABEL[member.role] ?? member.role}
            </p>
            <p className="mt-1 text-xs text-slate-600">Blood type {member.blood_type}</p>
            <p className="mt-1 text-xs text-slate-600">
              Donor {donorYes ? "Yes" : "No"}
            </p>
            {chips.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-nest-peach/60 px-2 py-0.5 text-[10px] text-nest-ink"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
          <HealthGauge score={member.health_index} size="sm" gradientId={`g-${member.id}`} />
        </CardContent>
      </Card>
    </Link>
  );
}
