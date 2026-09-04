import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeviceConnectors } from "@/components/DeviceConnectors";
import { Timeline } from "@/components/Timeline";
import { TimelineFilter } from "@/components/TimelineFilter";
import { UploadWidget } from "@/components/UploadWidget";
import { TargetBar } from "@/components/TargetBar";
import { HealthGauge } from "@/components/HealthGauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { memberStats } from "@/utils/data";
import { careLoopsForMember } from "@/utils/careloops";
import {
  allergyChips,
  conditionChips,
  getHealthProfile,
  medicationChips,
  memberKpiBars,
} from "@/utils/health";
import { companionAdviceForMember } from "@/utils/companion";
import { CompanionAdvicePanel } from "@/components/CompanionAdvice";
import { getTimeline, typesFromCat } from "@/utils/timeline";

export const dynamic = "force-dynamic";

export default function MemberPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { cat?: string };
}) {
  const member = memberStats(params.id);
  if (!member) notFound();
  const profile = getHealthProfile(params.id);
  const types = typesFromCat(searchParams.cat);
  const events = getTimeline(params.id, { types });
  const loops = careLoopsForMember(params.id);
  const kpis = memberKpiBars(params.id);
  const donor = member.donor_profile;
  const chips = conditionChips(member.id);
  const allergies = allergyChips(member.id);
  const meds = medicationChips(member.id);
  const companion = companionAdviceForMember(member.id);

  return (
    <div className="space-y-8">
      <p className="text-xs text-slate-500">
        <Link href="/" className="hover:underline">
          Family
        </Link>{" "}
        / {member.display_name}
      </p>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-[16rem] flex-1 items-start gap-4">
          <Image
            src={member.avatar_url}
            alt=""
            width={112}
            height={112}
            className="h-28 w-28 shrink-0 rounded-full object-cover shadow-md ring-2 ring-white"
          />
          <div>
            <h1 className="text-2xl font-semibold">
              {member.display_name}, {member.age}
            </h1>
            <p className="text-sm capitalize text-slate-600">{member.role}</p>
            <p className="mt-1 text-xs text-slate-600">Blood type {member.blood_type}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span
                  key={`c-${c}`}
                  className="rounded-full bg-nest-peach/60 px-2.5 py-0.5 text-[11px] text-nest-ink"
                >
                  {c}
                </span>
              ))}
              {allergies
                .filter((a) => !chips.includes(a))
                .map((a) => (
                  <span
                    key={`a-${a}`}
                    className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] text-amber-900"
                  >
                    {a}
                  </span>
                ))}
              {meds.map((m) => (
                <span
                  key={`m-${m}`}
                  className="rounded-full bg-nest-peach/70 px-2.5 py-0.5 text-[11px] text-nest-ink"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
        <HealthGauge
          score={profile?.health_index ?? null}
          size="lg"
          gradientId={`member-g-${member.id}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Urgent actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loops.length === 0 ? (
            <p className="text-sm text-slate-500">No open care loops on file.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {loops.map((loop) => (
                <li key={loop.id}>
                  <Link href={`/care-loops/${member.id}`} className="hover:text-nest-magenta">
                    {loop.title}
                  </Link>
                  <p className="text-xs text-slate-500">{loop.detail}</p>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={`/doctor-brief/${member.id}`}
            className="inline-flex h-8 items-center rounded-xl bg-nest-magenta px-3 text-xs font-medium text-white hover:bg-nest-magentadark"
          >
            Prepare appointment
          </Link>
        </CardContent>
      </Card>

      {kpis.length > 0 && (
        <section className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {kpis.map((k) => (
              <TargetBar
                key={k.id}
                id={k.id}
                label={k.label}
                value={k.value}
                target={k.target}
                displayValue={k.displayValue}
                displayTarget={k.displayTarget}
                note={k.note}
                max={k.max}
              />
            ))}
          </div>
          <p className="text-[11px] text-slate-400">
            Reference target on file. Not a medical diagnosis.
          </p>
        </section>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Donor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="font-medium">
            {donor.registered ? "Yes" : "No"} · {donor.category}
          </p>
          <p className="text-xs text-slate-600">
            {donor.donation_types.length
              ? `Type of donation: ${donor.donation_types.join(", ")}. `
              : ""}
            {donor.detail} CareNest does not assess transplant fitness.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload document or medication</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadWidget memberId={member.id} />
        </CardContent>
      </Card>

      <CompanionAdvicePanel
        variant="member"
        memberName={member.display_name}
        items={companion}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Connect devices
        </h2>
        <p className="text-xs text-slate-500">
          Simulated connectors. No live device feed. Device-reported (not medical diagnosis).
        </p>
        <DeviceConnectors memberId={member.id} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Timeline</h2>
        <Suspense>
          <TimelineFilter />
        </Suspense>
        <Timeline events={events} memberId={member.id} />
      </section>
    </div>
  );
}
