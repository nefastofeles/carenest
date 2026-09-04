import type {
  Member,
  MemberSummary,
  SeededAnomaly,
} from "@/types";
import { getDataset } from "@/utils/store";
import { careLoopsForMember } from "@/utils/careloops";
import { flagLine, getHealthProfile, nextAppointmentsForMember } from "@/utils/health";

export function loadDataset() {
  return getDataset();
}

export function getMembers(): Member[] {
  return getDataset().members;
}

export function getMember(id: string): Member | undefined {
  return getDataset().members.find((m) => m.id === id);
}

export function memberStats(id: string): MemberSummary | null {
  const dataset = getDataset();
  const member = dataset.members.find((m) => m.id === id);
  if (!member) return null;
  const total_visits =
    dataset.doctor_visits.filter((v) => v.member_id === id).length +
    dataset.dental_visits.filter((v) => v.member_id === id).length;
  const total_labs = dataset.lab_results.filter((l) => l.member_id === id).length;
  const total_vaccinations = dataset.vaccinations.filter(
    (v) => v.member_id === id
  ).length;
  const anomalies = anomaliesForMember(id);
  const next = nextAppointmentsForMember(id)[0];
  const profile = getHealthProfile(id);
  return {
    ...member,
    total_visits,
    total_labs,
    total_vaccinations,
    open_care_loops: careLoopsForMember(id).length,
    needs_review: anomalies.length,
    health_index: profile?.health_index ?? null,
    flag_line: flagLine(id),
    next_appointment_date: next?.date ?? null,
  };
}

export function allMemberSummaries(): MemberSummary[] {
  return getDataset().members.map((m) => memberStats(m.id)!);
}

export function anomaliesForMember(memberId: string): SeededAnomaly[] {
  const dataset = getDataset();
  const recordOwners = new Map<string, string>();
  for (const v of dataset.doctor_visits) recordOwners.set(v.visit_id, v.member_id);
  for (const v of dataset.dental_visits) recordOwners.set(v.visit_id, v.member_id);
  for (const l of dataset.lab_results) recordOwners.set(l.lab_id, l.member_id);
  for (const v of dataset.vaccinations)
    recordOwners.set(v.vaccination_id, v.member_id);
  for (const d of dataset.device_monthly) recordOwners.set(d.id, d.member_id);
  for (const d of dataset.device_events) recordOwners.set(d.event_id, d.member_id);

  return dataset.seeded_anomalies.filter((a) => {
    const ids = [a.record_id, ...(a.related_record_ids || [])];
    return ids.some((rid) => recordOwners.get(rid) === memberId);
  });
}

export function getAnomalies(memberId?: string): SeededAnomaly[] {
  if (!memberId) return getDataset().seeded_anomalies;
  return anomaliesForMember(memberId);
}

export function getMemberRecord(id: string) {
  const dataset = getDataset();
  const member = getMember(id);
  if (!member) return null;
  return {
    member,
    doctor_visits: dataset.doctor_visits.filter((v) => v.member_id === id),
    dental_visits: dataset.dental_visits.filter((v) => v.member_id === id),
    lab_results: dataset.lab_results.filter((l) => l.member_id === id),
    vaccinations: dataset.vaccinations.filter((v) => v.member_id === id),
    device_events: dataset.device_events.filter((e) => e.member_id === id),
    device_monthly: dataset.device_monthly.filter((e) => e.member_id === id),
    health_profile: getHealthProfile(id) ?? null,
  };
}
