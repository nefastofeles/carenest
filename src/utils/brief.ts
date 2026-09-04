import { compareDesc, parseISO } from "date-fns";
import { careLoopsForMember } from "@/utils/careloops";
import { getMember, getMemberRecord } from "@/utils/data";
import { demoToday, getStore } from "@/utils/store";

export function doctorBrief(memberId: string) {
  const member = getMember(memberId);
  const record = getMemberRecord(memberId);
  if (!member || !record) return null;

  const visits = [...record.doctor_visits].sort((a, b) =>
    compareDesc(parseISO(a.date), parseISO(b.date))
  );
  const lastVisit = visits[0] || null;
  const since = lastVisit ? lastVisit.date : "2024-01-01";
  const today = demoToday();
  const open = careLoopsForMember(memberId);
  const openRecordIds = new Set(open.map((a) => a.record_id));

  const testsSince = record.lab_results.filter((l) => {
    if (l.date > today) return false;
    return (
      l.date >= since ||
      openRecordIds.has(l.lab_id) ||
      (l.linked_visit_id && openRecordIds.has(l.linked_visit_id)) ||
      l.lab_id === "l_0007"
    );
  });
  const vaxSince = record.vaccinations.filter((v) => v.date >= since);
  const deviceSince = record.device_events.filter((e) => e.date >= since);

  const sources = [
    ...testsSince.map((l) => l.source_document),
    ...visits.slice(0, 3).map((v) => v.source_document),
    ...vaxSince.map((v) => v.source_document),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const reason =
    open.find((a) => a.is_demo_seed)?.detail ||
    lastVisit?.topic ||
    "Review of organised records. No single consultation reason on file.";

  const questions = [
    open.length
      ? `Open actions on file: ${open.map((a) => a.title).join("; ")}. Which should be addressed first?`
      : "CareNest has no open care-loop records. Confirm whether any follow-up is expected.",
    testsSince.some((t) => t.analytes.some((a) => a.flag === "high" || a.flag === "low"))
      ? "Some lab interpretations include flagged analytes. How should these be read in clinical context?"
      : "Recent lab interpretations are on file. Are any additional tests expected?",
    deviceSince.length
      ? "Device-reported events exist for this period. These are context only, not a diagnosis. Worth mentioning?"
      : "No device-reported events since the last visit.",
  ];

  return {
    member,
    generated_on: today,
    reason,
    last_visit: lastVisit
      ? {
          date: lastVisit.date,
          topic: lastVisit.topic,
          provider: lastVisit.provider_name,
          source: lastVisit.source_document,
        }
      : null,
    since_last_visit: {
      tests_completed: testsSince.map((l) => ({
        lab_id: l.lab_id,
        date: l.date,
        test_name: l.test_name,
        interpretation: l.interpretation ?? "No record found",
        source: l.source_document,
        confirmed: Boolean(l.user_confirmed || getStore().confirmedLabIds.has(l.lab_id)),
      })),
      vaccinations: vaxSince.map((v) => ({
        id: v.vaccination_id,
        date: v.date,
        name: v.vaccine_name,
        source: v.source_document,
      })),
      device_changes: deviceSince.map((e) => ({
        id: e.event_id,
        date: e.date,
        narrative: e.narrative,
        label: e.label,
      })),
    },
    open_actions: open,
    questions,
    sources,
  };
}
