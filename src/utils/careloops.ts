import { differenceInCalendarDays, parseISO } from "date-fns";
import type { CareLoopAction } from "@/types";
import { getDataset, getStore, demoToday } from "@/utils/store";

const OPTIONS = ["Book Lab", "Add Appointment", "Ask doctor", "Dismiss"];

export function careLoopsForMember(memberId: string): CareLoopAction[] {
  const dataset = getDataset();
  const store = getStore();
  const today = parseISO(demoToday());
  const actions: CareLoopAction[] = [];

  for (const v of dataset.doctor_visits.filter((x) => x.member_id === memberId)) {
    const status = (v.follow_up_status || "").toLowerCase();
    if (!v.follow_up_date) continue;
    if (status === "completed" || status === "none") continue;
    const due = parseISO(v.follow_up_date);
    const days = differenceInCalendarDays(due, today);
    const isDemo = v.visit_id === "v_0029";
    const overdue = days < 0 || status === "overdue";
    actions.push({
      id: `loop-${v.visit_id}`,
      member_id: memberId,
      type: isDemo ? "repeat_lab" : "follow_up",
      title: isDemo
        ? "Repeat blood analysis requested"
        : `${v.topic} follow-up`,
      due_date: v.follow_up_date,
      days_until_due: days,
      status: overdue ? "overdue" : status || "scheduled",
      detail: isDemo
        ? `Repeat blood analysis due in ${days} days. No appointment found.`
        : overdue
          ? `Follow-up date ${v.follow_up_date} is in the past. CareNest has no evidence of a completed visit. Status: ${v.follow_up_status}.`
          : `Follow-up recorded as ${v.follow_up_status}. Due ${v.follow_up_date}.`,
      record_id: v.visit_id,
      table: "doctor_visits",
      action_options: OPTIONS,
      is_demo_seed: isDemo,
    });
  }

  for (const l of dataset.lab_results.filter((x) => x.member_id === memberId)) {
    if (l.lab_id === "l_0007" && l.follow_up_date) {
      // Covered by v_0029 demo loop — avoid duplicate card.
      continue;
    }
    if (!l.interpretation) {
      actions.push({
        id: `loop-${l.lab_id}-interp`,
        member_id: memberId,
        type: "missing_interpretation",
        title: `${l.test_name}: no interpretation on record`,
        due_date: l.date,
        days_until_due: differenceInCalendarDays(parseISO(l.date), today),
        status: "needs_review",
        detail: `CareNest has no interpretation for ${l.lab_id}. This is not evidence that the test was skipped.`,
        record_id: l.lab_id,
        table: "lab_results",
        action_options: ["Ask doctor", "Dismiss"],
        is_demo_seed: l.lab_id === "l_0009",
      });
    }
  }

  for (const v of dataset.vaccinations.filter((x) => x.member_id === memberId)) {
    if (v.series_status !== "booster_due" || !v.next_dose_due) continue;
    const days = differenceInCalendarDays(parseISO(v.next_dose_due), today);
    if (days >= 0) continue;
    actions.push({
      id: `loop-${v.vaccination_id}`,
      member_id: memberId,
      type: "past_due_booster",
      title: `${v.vaccine_name}: booster date in the past`,
      due_date: v.next_dose_due,
      days_until_due: days,
      status: "booster_due",
      detail: `Series status is booster_due. Next dose date on record is ${v.next_dose_due}. CareNest has no later dose record.`,
      record_id: v.vaccination_id,
      table: "vaccinations",
      action_options: OPTIONS,
      is_demo_seed: v.vaccination_id === "vac_0011",
    });
  }

  return actions
    .filter((a) => !store.dismissedLoopIds.has(a.id))
    .sort((a, b) => {
      if (a.is_demo_seed !== b.is_demo_seed) return a.is_demo_seed ? -1 : 1;
      const da = a.days_until_due ?? 9999;
      const db = b.days_until_due ?? 9999;
      return da - db;
    });
}

export function dismissCareLoop(id: string) {
  getStore().dismissedLoopIds.add(id);
}
