import { compareDesc, parseISO } from "date-fns";
import type { SeededAnomaly, TimelineEvent, TimelineEventType } from "@/types";
import { getDataset } from "@/utils/store";
import { anomaliesForMember } from "@/utils/data";

function anomalyHits(
  anomalies: SeededAnomaly[],
  recordId: string
): SeededAnomaly[] {
  return anomalies.filter(
    (a) => a.record_id === recordId || a.related_record_ids?.includes(recordId)
  );
}

export function getTimeline(
  memberId: string,
  opts?: { from?: string; to?: string; types?: TimelineEventType[] }
): TimelineEvent[] {
  const dataset = getDataset();
  const anomalies = anomaliesForMember(memberId);
  const events: TimelineEvent[] = [];

  for (const v of dataset.doctor_visits.filter((x) => x.member_id === memberId)) {
    const hits = anomalyHits(anomalies, v.visit_id);
    events.push({
      id: v.visit_id,
      member_id: memberId,
      date: v.date,
      type: "doctor_visit",
      title: v.topic,
      summary: [v.diagnosis, v.recommendation].filter(Boolean).join(" — "),
      provider: v.provider_name,
      source_label: `From ${v.source_document}`,
      source_document: v.source_document,
      flag: hits.length > 0,
      anomaly_ids: hits.map((h) => h.id),
      category: "doctor_visit",
    });
  }

  for (const v of dataset.dental_visits.filter((x) => x.member_id === memberId)) {
    const hits = anomalyHits(anomalies, v.visit_id);
    events.push({
      id: v.visit_id,
      member_id: memberId,
      date: v.date,
      type: "dental_visit",
      title: v.topic,
      summary: [v.treatment, v.recommendation].filter(Boolean).join(" — "),
      provider: v.clinic,
      source_label: `From ${v.source_document}`,
      source_document: v.source_document,
      flag: hits.length > 0,
      anomaly_ids: hits.map((h) => h.id),
      category: "dental_visit",
    });
  }

  for (const l of dataset.lab_results.filter((x) => x.member_id === memberId)) {
    const hits = anomalyHits(anomalies, l.lab_id);
    const interp = l.interpretation ?? "No record found for interpretation.";
    events.push({
      id: l.lab_id,
      member_id: memberId,
      date: l.date,
      type: "lab",
      title: l.test_name,
      summary: interp,
      provider: l.ordering_reason,
      source_label: `From ${l.source_document}`,
      source_document: l.source_document,
      flag: hits.length > 0,
      anomaly_ids: hits.map((h) => h.id),
      category: "lab",
    });
  }

  for (const v of dataset.vaccinations.filter((x) => x.member_id === memberId)) {
    const hits = anomalyHits(anomalies, v.vaccination_id);
    events.push({
      id: v.vaccination_id,
      member_id: memberId,
      date: v.date,
      type: "vaccination",
      title: v.vaccine_name,
      summary: `Series status: ${v.series_status ?? "No record found"}. Source: ${v.source ?? "clinic record"}.`,
      source_label: `From ${v.source_document}`,
      source_document: v.source_document,
      flag: hits.length > 0,
      anomaly_ids: hits.map((h) => h.id),
      category: "vaccination",
    });
  }

  for (const e of dataset.device_events.filter((x) => x.member_id === memberId)) {
    events.push({
      id: e.event_id,
      member_id: memberId,
      date: e.date,
      type: "device_event",
      title: e.event_type.replace(/_/g, " "),
      summary: e.narrative,
      provider: e.device,
      source_label: e.label,
      source_document: null,
      flag: false,
      anomaly_ids: [],
      category: "device_event",
    });
  }

  return events
    .filter((e) => {
      if (opts?.from && e.date < opts.from) return false;
      if (opts?.to && e.date > opts.to) return false;
      if (opts?.types?.length && !opts.types.includes(e.type)) return false;
      return true;
    })
    .sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)));
}

export const TYPE_LABELS: Record<TimelineEventType, string> = {
  doctor_visit: "Medical visit",
  dental_visit: "Dental",
  lab: "Lab",
  vaccination: "Vaccination",
  device_event: "Device-reported",
  device_monthly: "Device monthly",
};

const CAT_TYPES: Record<string, TimelineEventType[]> = {
  medical: ["doctor_visit"],
  lab: ["lab"],
  vaccination: ["vaccination"],
  dental: ["dental_visit"],
  device: ["device_event", "device_monthly"],
};

export function typesFromCat(cat?: string | null): TimelineEventType[] | undefined {
  if (!cat || cat === "all") return undefined;
  return CAT_TYPES[cat];
}
