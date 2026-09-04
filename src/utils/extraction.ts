import type { ExtractedDocument, ExtractedKind } from "@/types";
import { getDataset, getStore } from "@/utils/store";

export function simulateExtraction(
  memberId?: string,
  kind: ExtractedKind = "lab"
): ExtractedDocument {
  const dataset = getDataset();
  const pending = getStore().pendingExtraction;

  if (kind === "medication") {
    const mid = memberId || pending?.member_id || "m_001";
    const member = dataset.members.find((m) => m.id === mid);
    const profile = dataset.health_profiles.find((p) => p.member_id === mid);
    if (!member || !profile) {
      throw new Error("No health profile on file for medication extraction.");
    }
    const preferred =
      mid === "m_001"
        ? "med_m001_amlodipine"
        : mid === "m_002"
          ? "med_m002_metformin"
          : profile.medications[0]?.id;
    const med = profile.medications.find((m) => m.id === preferred) || profile.medications[0];
    if (!med) {
      throw new Error("No medication on file for this member.");
    }
    getStore().pendingExtraction = {
      kind: "medication",
      member_id: mid,
      record_id: med.id,
    };
    return {
      kind: "medication",
      member_id: mid,
      member_name: member.display_name,
      test_name: `${med.name} record`,
      date: "2026-09-03",
      result: `${med.name} ${med.dose}. Status ${med.status} on file.`,
      doctor_instruction:
        "History on file only. CareNest does not change doses or prescriptions.",
      source_document: `sources/${med.id}_upload_stub.pdf`,
      medication_id: med.id,
      confidence: 0.9,
      requires_confirmation: true,
    };
  }

  const lab = dataset.lab_results.find((l) => l.lab_id === "l_0007");
  if (!lab) {
    throw new Error("Seed lab l_0007 is missing from the dataset.");
  }
  const member = dataset.members.find((m) => m.id === lab.member_id)!;
  getStore().pendingExtraction = {
    kind: "lab",
    member_id: memberId || lab.member_id,
    record_id: lab.lab_id,
  };
  return {
    kind: "lab",
    member_id: memberId || lab.member_id,
    member_name: member.display_name,
    test_name: lab.test_name,
    date: lab.date,
    result: lab.interpretation || "No record found",
    doctor_instruction: lab.action_taken || "No record found",
    source_document: lab.source_document,
    lab_id: lab.lab_id,
    confidence: 0.92,
    requires_confirmation: true,
  };
}

export function confirmExtraction(input: {
  kind: ExtractedKind;
  lab_id?: string;
  medication_id?: string;
  member_id: string;
}) {
  const store = getStore();
  if (input.kind === "medication") {
    const mid = input.medication_id || store.pendingExtraction?.record_id;
    const profile = store.dataset.health_profiles.find((p) => p.member_id === input.member_id);
    const med = profile?.medications.find((m) => m.id === mid);
    if (!med) {
      throw new Error("Medication record not found");
    }
    med.user_confirmed = true;
    med.source_document = `sources/${med.id}_upload_stub.pdf`;
    store.pendingExtraction = null;
    return med;
  }

  const labId = input.lab_id || "l_0007";
  const lab = store.dataset.lab_results.find((l) => l.lab_id === labId);
  if (!lab) {
    throw new Error("Lab record not found");
  }
  lab.user_confirmed = true;
  store.confirmedLabIds.add(labId);
  store.pendingExtraction = null;
  return lab;
}
