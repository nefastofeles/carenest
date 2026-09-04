import Link from "next/link";
import { MemberCard } from "@/components/MemberCard";
import { AppointmentActions } from "@/components/AppointmentActions";
import { MakeAppointmentButton } from "@/components/MakeAppointmentButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { allMemberSummaries } from "@/utils/data";
import { familyAttention, familyBookedAppointments, familyPhysicians } from "@/utils/health";
import { familyCompanionAdvice } from "@/utils/companion";
import { CompanionAdvicePanel } from "@/components/CompanionAdvice";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const members = allMemberSummaries();
  const attention = familyAttention();
  const booked = familyBookedAppointments();
  const physicians = familyPhysicians();
  const companion = familyCompanionAdvice();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Jensen Smith Family</h1>
      </div>

      <section>
        <div className="grid gap-4 sm:grid-cols-2">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Attention</CardTitle>
        </CardHeader>
        <CardContent>
          {attention.length === 0 ? (
            <p className="text-sm text-slate-500">No record found for open attention items.</p>
          ) : (
            <ul className="space-y-4">
              {attention.map((a) => (
                <li key={a.id} className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-slate-600">{a.detail}</p>
                  </div>
                  <Link
                    href={
                      a.kind === "missing_booking"
                        ? `/care-loops/${a.member_id}`
                        : `/members/${a.member_id}`
                    }
                    className="inline-flex h-8 shrink-0 items-center rounded-xl bg-nest-magenta px-3 text-xs font-medium text-white hover:bg-nest-magentadark"
                  >
                    Take action
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          {booked.length === 0 ? (
            <p className="text-sm text-slate-500">No record found for booked follow-up dates.</p>
          ) : (
            <ul className="space-y-4">
              {booked.map((n) => (
                <li key={`${n.record_id}-${n.date}`}>
                  <Link href={`/members/${n.member_id}`} className="block hover:text-nest-magenta">
                    <p className="text-sm font-medium">
                      {n.date} · {n.member_name}
                    </p>
                    <p className="text-xs text-slate-600">
                      {n.topic}. {n.note}
                    </p>
                  </Link>
                  <AppointmentActions memberId={n.member_id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Physicians</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-5">
            {physicians.map((p) => (
              <li key={p.id} className="flex gap-3">
                <Image
                  src={p.avatar_url}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.specialty}</p>
                  <p className="text-xs text-slate-600">{p.hospital}</p>
                  <p className="text-xs tabular-nums text-slate-600">{p.phone}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Patients:{" "}
                    {p.patients.map((m, i) => (
                      <span key={m.id}>
                        {i > 0 && ", "}
                        <Link href={`/members/${m.id}`} className="text-nest-magenta hover:underline">
                          {m.display_name}
                        </Link>
                      </span>
                    ))}
                  </p>
                  <MakeAppointmentButton />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <CompanionAdvicePanel variant="family" summary={companion.summary} items={companion.items} />
    </div>
  );
}
