import type {
  AttentionItem,
  DeviceKind,
  FamilyAlert,
  HealthProfile,
  NextAppointment,
} from "@/types";
import { careLoopsForMember } from "@/utils/careloops";
import { getDataset, getStore, demoToday } from "@/utils/store";

export const DEVICE_CATALOG: { id: DeviceKind; label: string }[] = [
  { id: "apple_watch", label: "Apple Watch" },
  { id: "whoop", label: "Whoop" },
  { id: "oura_ring", label: "Oura ring" },
  { id: "blood_pressure_monitor", label: "Blood pressure monitor" },
  { id: "glucose_monitor", label: "Glucose monitor" },
];

export function deviceKey(memberId: string, device: string) {
  return `${memberId}:${device}`;
}

export function getHealthProfile(memberId: string): HealthProfile | undefined {
  return getDataset().health_profiles.find((p) => p.member_id === memberId);
}

export function flagLine(memberId: string): string {
  const profile = getHealthProfile(memberId);
  if (!profile) return "No health profile on file.";
  const first = profile.conditions[0];
  if (profile.current_smoker) return "Smoking status on file";
  if (first) return first.name;
  return "No chronic conditions on file";
}

export function nextAppointmentsForMember(memberId: string): NextAppointment[] {
  const dataset = getDataset();
  const member = dataset.members.find((m) => m.id === memberId);
  if (!member) return [];
  const today = demoToday();
  return dataset.doctor_visits
    .filter(
      (v) =>
        v.member_id === memberId &&
        v.follow_up_date &&
        v.follow_up_date >= today &&
        (v.follow_up_status || "").toLowerCase() !== "completed" &&
        (v.follow_up_status || "").toLowerCase() !== "none"
    )
    .map((v) => ({
      member_id: memberId,
      member_name: member.display_name,
      date: v.follow_up_date as string,
      topic: v.topic,
      status: v.follow_up_status || "scheduled",
      record_id: v.visit_id,
      note:
        v.visit_id === "v_0029"
          ? "No appointment found in CareNest."
          : "Follow-up date on file.",
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function familyNextAppointments(): NextAppointment[] {
  return getDataset()
    .members.flatMap((m) => nextAppointmentsForMember(m.id))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const MED_HORIZON_DAYS = 30;

function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function familyAttention(): AttentionItem[] {
  const dataset = getDataset();
  const today = demoToday();
  const horizon = addDaysIso(today, MED_HORIZON_DAYS);
  const items: AttentionItem[] = [];

  for (const visit of dataset.doctor_visits) {
    if (visit.booking_status !== "missing") continue;
    const member = dataset.members.find((m) => m.id === visit.member_id);
    if (!member) continue;
    items.push({
      id: `att-${visit.visit_id}`,
      member_id: visit.member_id,
      member_name: member.display_name,
      title: `${member.display_name}: no appointment found`,
      detail: `CareNest has no appointment on file for ${visit.topic}${
        visit.follow_up_date ? ` (follow-up date ${visit.follow_up_date})` : ""
      }.`,
      href: `/members/${visit.member_id}`,
      kind: "missing_booking",
      date: visit.follow_up_date || visit.date,
    });
  }

  for (const profile of dataset.health_profiles) {
    const member = dataset.members.find((m) => m.id === profile.member_id);
    if (!member) continue;
    for (const med of profile.medications) {
      if (med.refill_due && med.refill_due <= horizon) {
        items.push({
          id: `att-${med.id}-refill`,
          member_id: member.id,
          member_name: member.display_name,
          title: `${member.display_name}: ${med.name} refill date`,
          detail: `Refill date on file: ${med.refill_due}.`,
          href: `/members/${member.id}`,
          kind: "medication",
          date: med.refill_due,
        });
      }
      if (med.expiry_date && med.expiry_date <= horizon) {
        items.push({
          id: `att-${med.id}-expiry`,
          member_id: member.id,
          member_name: member.display_name,
          title: `${member.display_name}: ${med.name} expiry date`,
          detail: `Expiry date on file: ${med.expiry_date}.`,
          href: `/members/${member.id}`,
          kind: "medication",
          date: med.expiry_date,
        });
      }
    }
  }

  return items.sort((a, b) => a.date.localeCompare(b.date));
}

export function familyBookedAppointments(): NextAppointment[] {
  const dataset = getDataset();
  const today = demoToday();
  return dataset.doctor_visits
    .filter(
      (v) =>
        v.booking_status === "booked" &&
        Boolean(v.follow_up_date) &&
        (v.follow_up_date as string) >= today
    )
    .map((v) => {
      const member = dataset.members.find((m) => m.id === v.member_id);
      return {
        member_id: v.member_id,
        member_name: member?.display_name ?? v.member_id,
        date: v.follow_up_date as string,
        topic: v.topic,
        status: v.follow_up_status || "scheduled",
        record_id: v.visit_id,
        note: "Follow-up date on file.",
        booking_status: "booked" as const,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function alertsForMember(memberId: string): FamilyAlert[] {
  const dataset = getDataset();
  const member = dataset.members.find((m) => m.id === memberId);
  const profile = getHealthProfile(memberId);
  if (!member || !profile) return [];
  const alerts: FamilyAlert[] = [];
  const href = `/members/${memberId}`;

  if (profile.current_smoker) {
    alerts.push({
      id: `${memberId}-smoker`,
      member_id: memberId,
      member_name: member.display_name,
      title: "Smoking status on file",
      detail: "Current smoker recorded. CareNest has no cessation prescription on file.",
      href,
    });
  }
  if (profile.bp_systolic_avg >= 140 && member.age >= 18) {
    alerts.push({
      id: `${memberId}-bp`,
      member_id: memberId,
      member_name: member.display_name,
      title: "Blood pressure average on file",
      detail: `Clinic or device-reported average ${profile.bp_systolic_avg}/${profile.bp_diastolic_avg} mmHg.`,
      href,
    });
  }
  if (profile.conditions.some((c) => c.name.toLowerCase().includes("diabetes"))) {
    alerts.push({
      id: `${memberId}-t2d`,
      member_id: memberId,
      member_name: member.display_name,
      title: "Type 2 diabetes on file",
      detail: "Recorded in clinic notes. Not a CareNest diagnosis.",
      href,
    });
  }

  for (const loop of careLoopsForMember(memberId)) {
    if (loop.status === "overdue" || loop.is_demo_seed) {
      alerts.push({
        id: loop.id,
        member_id: memberId,
        member_name: member.display_name,
        title: loop.title,
        detail: loop.detail,
        href: `/care-loops/${memberId}`,
      });
    }
  }
  return alerts;
}

export function familyAlerts(): FamilyAlert[] {
  return getDataset().members.flatMap((m) => alertsForMember(m.id));
}

export function connectedDevicesFor(memberId: string): string[] {
  const store = getStore();
  return DEVICE_CATALOG.map((d) => d.id).filter((id) =>
    store.connectedDevices.has(deviceKey(memberId, id))
  );
}

export type BarTone = "red" | "yellow" | "green";

export type KpiBar = {
  id: string;
  label: string;
  value: number;
  target: number;
  displayValue: string;
  displayTarget: string;
  tone: BarTone;
  note: string;
  max: number;
  lowerBetter?: boolean;
};

function higherBetter(value: number, target: number): BarTone {
  if (value >= target) return "green";
  if (value >= target * 0.95) return "yellow";
  return "red";
}

function lowerBetter(value: number, target: number, slack: number): BarTone {
  if (value <= target) return "green";
  if (value <= target + slack) return "yellow";
  return "red";
}

function bmiTone(bmi: number, target: number, adult: boolean): BarTone {
  if (adult) {
    if (bmi < 18.5 || bmi > 24.9) return "red";
    if (Math.abs(bmi - target) <= 1) return "green";
    return "yellow";
  }
  if (Math.abs(bmi - target) <= 2) return "green";
  if (Math.abs(bmi - target) <= 4) return "yellow";
  return "red";
}

export function memberKpiBars(memberId: string): KpiBar[] {
  const member = getDataset().members.find((m) => m.id === memberId);
  const profile = getHealthProfile(memberId);
  if (!member || !profile) return [];
  const adult = member.age >= 18;
  const bmiTarget = member.id === "m_003" ? 15.8 : member.id === "m_004" ? 15.2 : 22;
  const bpTarget = adult
    ? { sys: 120, dia: 80 }
    : member.id === "m_003"
      ? { sys: 105, dia: 65 }
      : { sys: 100, dia: 60 };
  const rhrTarget = adult ? 50 : 80;

  return [
    {
      id: "sleep",
      label: "Sleep score (7d)",
      value: profile.sleep_score_7d,
      target: 90,
      displayValue: String(profile.sleep_score_7d),
      displayTarget: "90",
      tone: higherBetter(profile.sleep_score_7d, 90),
      note: "Device-reported (not medical diagnosis)",
      max: 100,
    },
    {
      id: "steps",
      label: "Avg daily steps (7d)",
      value: profile.steps_avg_7d,
      target: 10000,
      displayValue: profile.steps_avg_7d.toLocaleString("en-GB"),
      displayTarget: "10,000",
      tone: higherBetter(profile.steps_avg_7d, 10000),
      note: "Device-reported (not medical diagnosis)",
      max: 14000,
    },
    {
      id: "bmi",
      label: "BMI",
      value: profile.bmi,
      target: bmiTarget,
      displayValue: profile.bmi.toFixed(1),
      displayTarget: bmiTarget.toFixed(1),
      tone: bmiTone(profile.bmi, bmiTarget, adult),
      note: "Calculated from height/weight on file. WHO adult range 18.5–24.9; child values are age estimates.",
      max: Math.max(40, profile.bmi * 1.2),
      lowerBetter: true,
    },
    {
      id: "bp",
      label: "Avg blood pressure",
      value: profile.bp_systolic_avg,
      target: bpTarget.sys,
      displayValue: `${profile.bp_systolic_avg}/${profile.bp_diastolic_avg}`,
      displayTarget: `${bpTarget.sys}/${bpTarget.dia}`,
      tone: lowerBetter(profile.bp_systolic_avg, bpTarget.sys, 5),
      note: "Clinic or device-reported average on file. Colour uses systolic vs reference.",
      max: Math.max(180, profile.bp_systolic_avg + 10),
    },
    {
      id: "rhr",
      label: "Avg resting heart rate",
      value: profile.resting_hr_avg,
      target: rhrTarget,
      displayValue: `${profile.resting_hr_avg} bpm`,
      displayTarget: `${rhrTarget} bpm`,
      tone: lowerBetter(profile.resting_hr_avg, rhrTarget, Math.round(rhrTarget * 0.05)),
      note: "Device-reported (not medical diagnosis)",
      max: 120,
      lowerBetter: true,
    },
  ];
}

export function familyPhysicians() {
  const dataset = getDataset();
  return dataset.physicians.map((p) => ({
    ...p,
    patients: p.patient_ids
      .map((id) => dataset.members.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m)),
  }));
}

export function conditionChips(memberId: string): string[] {
  const profile = getHealthProfile(memberId);
  if (!profile) return [];
  const chips: string[] = [];
  for (const c of profile.conditions) {
    const n = c.name.toLowerCase();
    if (n.includes("recovered") || n.includes("wrist")) continue;
    if (n.includes("hypertension")) chips.push("Hypertension");
    else if (n.includes("smoker")) chips.push("Smoker");
    else if (n.includes("diabetes")) chips.push("Type 2 diabetes");
    else if (n.includes("allergy")) chips.push("Egg allergy");
    else if (n.includes("iron")) chips.push("Iron deficiency");
    else chips.push(c.name);
  }
  return chips;
}

export function allergyChips(memberId: string): string[] {
  return conditionChips(memberId).filter((c) => c.toLowerCase().includes("allergy"));
}

export function medicationChips(memberId: string): string[] {
  const profile = getHealthProfile(memberId);
  if (!profile) return [];
  return profile.medications.filter((m) => m.status === "active").map((m) => m.name);
}

export const MEMBER_CALENDAR_COLOR: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  m_001: { bg: "bg-pink-50", text: "text-pink-900", dot: "bg-nest-magenta", label: "Marco" },
  m_002: { bg: "bg-amber-50", text: "text-amber-900", dot: "bg-nest-gold", label: "Sofie" },
  m_003: { bg: "bg-sky-50", text: "text-sky-800", dot: "bg-sky-500", label: "Lukas" },
  m_004: { bg: "bg-orange-50", text: "text-orange-900", dot: "bg-orange-400", label: "Emma" },
};

export type CalendarEvent = {
  id: string;
  member_id: string;
  member_name: string;
  date: string;
  title: string;
  kind: "visit" | "follow_up" | "dental";
};

export function familyCalendarEvents(year = 2026): CalendarEvent[] {
  const dataset = getDataset();
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const events: CalendarEvent[] = [];
  const name = (id: string) =>
    dataset.members.find((m) => m.id === id)?.display_name ?? id;

  for (const v of dataset.doctor_visits) {
    if (v.date >= start && v.date <= end) {
      events.push({
        id: `${v.visit_id}-visit`,
        member_id: v.member_id,
        member_name: name(v.member_id),
        date: v.date,
        title: v.topic,
        kind: "visit",
      });
    }
    if (v.follow_up_date && v.follow_up_date >= start && v.follow_up_date <= end) {
      events.push({
        id: `${v.visit_id}-fu`,
        member_id: v.member_id,
        member_name: name(v.member_id),
        date: v.follow_up_date,
        title: `Follow-up: ${v.topic}`,
        kind: "follow_up",
      });
    }
  }
  for (const v of dataset.dental_visits) {
    if (v.date >= start && v.date <= end) {
      events.push({
        id: `${v.visit_id}-dental`,
        member_id: v.member_id,
        member_name: name(v.member_id),
        date: v.date,
        title: v.topic,
        kind: "dental",
      });
    }
  }
  return events.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
