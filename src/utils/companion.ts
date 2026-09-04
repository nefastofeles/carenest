import type { CompanionAdviceItem, LabResult } from "@/types";
import { getDataset } from "@/utils/store";
import { getHealthProfile } from "@/utils/health";

const HAS = "https://www.has-sante.fr";
const SPF_TOBACCO = "https://www.santepubliquefrance.fr/determinants-de-sante/tabac";
const SPF_VAX =
  "https://www.santepubliquefrance.fr/determinants-de-sante/vaccination";
const MANGER_BOUGER = "https://www.mangerbouger.fr";
const AMELI_ALLERGY =
  "https://www.ameli.fr/assure/sante/themes/allergie-alimentaire";

function latestMatchingLab(memberId: string, needle: string): LabResult | undefined {
  const labs = getDataset()
    .lab_results.filter(
      (l) =>
        l.member_id === memberId &&
        `${l.test_name} ${l.interpretation ?? ""}`.toLowerCase().includes(needle)
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return labs[0];
}

function analyteLine(lab: LabResult | undefined, nameNeedle: string): string | null {
  if (!lab) return null;
  const a = lab.analytes.find((x) => x.name.toLowerCase().includes(nameNeedle));
  if (!a) return null;
  const value =
    a.value != null ? `${a.value}${a.unit ? ` ${a.unit}` : ""}` : "flagged on file";
  return `${a.name} ${value}${a.flag ? ` (${a.flag})` : ""}`;
}

export function companionAdviceForMember(memberId: string): CompanionAdviceItem[] {
  const dataset = getDataset();
  const member = dataset.members.find((m) => m.id === memberId);
  const profile = getHealthProfile(memberId);
  if (!member || !profile) return [];

  const items: CompanionAdviceItem[] = [];
  const name = member.display_name;

  const lipid = latestMatchingLab(memberId, "lipid");
  const ldl = analyteLine(lipid, "ldl");
  const lipidHigh =
    Boolean(ldl?.toLowerCase().includes("high")) ||
    (lipid?.interpretation ?? "").toLowerCase().includes("elevated ldl");
  if (lipid && lipidHigh && member.age >= 18) {
    items.push({
      id: `${memberId}-lipid`,
      member_id: memberId,
      member_name: name,
      based_on: `${lipid.test_name} (${lipid.lab_id}, ${lipid.date}). ${ldl}.`,
      title: "Lipid result on file — lifestyle discussion",
      body: `${name}'s lipid panel is on file with LDL flagged high. HAS cardiovascular guidance commonly discusses diet pattern, activity, and a planned repeat test with the physician. CareNest does not start or stop lipid-lowering medicine. Bring this result to the next GP visit.`,
      guideline: "HAS — cardiovascular risk",
      guideline_url: HAS,
    });
  }

  if (profile.bp_systolic_avg >= 140 && member.age >= 18) {
    const bpMed = profile.medications.find((m) =>
      /amlodipine|ramipril|lisinopril|losartan/i.test(m.name)
    );
    items.push({
      id: `${memberId}-bp`,
      member_id: memberId,
      member_name: name,
      based_on: `Average blood pressure on file ${profile.bp_systolic_avg}/${profile.bp_diastolic_avg} mmHg. Hypertension recorded in clinic notes.`,
      title: "Blood pressure — home measures and salt",
      body: `General practice guidance for adults with raised readings on file includes home measurement technique, limiting salt, and keeping any recorded blood-pressure medicine as prescribed${bpMed ? ` (${bpMed.name} ${bpMed.dose})` : ""}. This is not a dose change. Ask the GP how they want home readings shared.`,
      guideline: "HAS — hypertension",
      guideline_url: HAS,
    });
  }

  if (profile.current_smoker) {
    items.push({
      id: `${memberId}-tobacco`,
      member_id: memberId,
      member_name: name,
      based_on: "Current smoker recorded at the 20 Aug 2026 blood pressure review. No cessation prescription on file.",
      title: "Tobacco — support programmes, not a prescription",
      body: `Santé publique France lists free cessation support (including Tabac Info Service). A GP can discuss nicotine replacement or other options. CareNest has no cessation product on file and does not prescribe.`,
      guideline: "Santé publique France — tobacco",
      guideline_url: SPF_TOBACCO,
    });
  }

  const hba1cLab = latestMatchingLab(memberId, "hba1c");
  const hba1c = analyteLine(hba1cLab, "hba1c");
  const hasDiabetes = profile.conditions.some((c) =>
    c.name.toLowerCase().includes("diabetes")
  );
  const hba1cHigh = hba1cLab?.analytes.some(
    (a) => a.name.toLowerCase().includes("hba1c") && a.flag === "high"
  );
  if (hasDiabetes || hba1cHigh) {
    const metformin = profile.medications.find((m) =>
      m.name.toLowerCase().includes("metformin")
    );
    items.push({
      id: `${memberId}-hba1c`,
      member_id: memberId,
      member_name: name,
      based_on: hba1cLab
        ? `${hba1cLab.test_name} (${hba1cLab.lab_id}, ${hba1cLab.date}). ${hba1c || hba1cLab.interpretation || "On file"}.`
        : "Type 2 diabetes recorded in clinic notes.",
      title: "HbA1c on file — activity and meal pattern",
      body: `${name}'s latest HbA1c is on file. HAS type 2 diabetes guidance discusses activity (about 150 minutes a week), a regular meal pattern${metformin ? ", and reviewing the recorded Metformin plan with the physician" : ""}. This is not a new target or a dose change.`,
      guideline: "HAS — type 2 diabetes",
      guideline_url: HAS,
    });
  }

  if (profile.conditions.some((c) => c.name.toLowerCase().includes("iron"))) {
    items.push({
      id: `${memberId}-iron`,
      member_id: memberId,
      member_name: name,
      based_on: "Iron-deficiency episode on file. Ferrous sulfate recorded as active.",
      title: "Iron supplement — everyday practice",
      body: `General practice advice with oral iron on file is to take it as recorded, often with vitamin C, and to avoid tea or coffee around the dose. Do not change the dose. Recheck timing stays with the clinic.`,
      guideline: "HAS — iron deficiency",
      guideline_url: HAS,
    });
  }

  if (profile.conditions.some((c) => c.name.toLowerCase().includes("allergy"))) {
    const epi = profile.medications.find((m) =>
      m.name.toLowerCase().includes("epinephrine")
    );
    const expiry = epi?.expiry_date ? ` Auto-injector expiry on file: ${epi.expiry_date}.` : "";
    items.push({
      id: `${memberId}-allergy`,
      member_id: memberId,
      member_name: name,
      based_on: `Egg allergy on file.${expiry}`,
      title: "Egg allergy — avoidance and emergency kit",
      body: `Ameli and allergy guidance for families: strict egg avoidance (including hidden egg in canteen food), a written school or nursery plan (PAI), and an in-date epinephrine auto-injector as prescribed. CareNest does not judge severity or fitness for school trips.`,
      guideline: "Ameli — food allergy",
      guideline_url: AMELI_ALLERGY,
    });
  }

  if (member.age < 18) {
    items.push({
      id: `${memberId}-vax`,
      member_id: memberId,
      member_name: name,
      based_on: "Childhood immunisation calendar may apply. One labelled demo notice is on file for the household.",
      title: "Childhood vaccination calendar",
      body: `Santé publique France publishes the national childhood immunisation calendar. CareNest has no matching record for at least one listed dose. This is not a statement that a vaccine is medically required. Review the calendar with the paediatrician.`,
      guideline: "Santé publique France — vaccination",
      guideline_url: SPF_VAX,
    });
  }

  if (profile.sleep_score_7d < 75 && member.age >= 18) {
    items.push({
      id: `${memberId}-sleep`,
      member_id: memberId,
      member_name: name,
      based_on: `Device-reported 7-day sleep score ${profile.sleep_score_7d} (reference 90). Not a medical diagnosis.`,
      title: "Sleep score — routine, not a sleep diagnosis",
      body: `Device sleep scores are not a diagnosis. General practice suggestions include a regular wind-down, limiting late caffeine, and a dark bedroom. If daytime sleepiness persists, raise it with the GP.`,
      guideline: "Santé publique France — sleep hygiene",
      guideline_url: "https://www.santepubliquefrance.fr",
    });
  }

  if (profile.steps_avg_7d < 8000) {
    items.push({
      id: `${memberId}-steps`,
      member_id: memberId,
      member_name: name,
      based_on: `Device-reported average ${profile.steps_avg_7d.toLocaleString("en-GB")} steps / day over 7 days.`,
      title: "Daily steps — Manger Bouger activity pattern",
      body: `French PNNS / Manger Bouger guidance encourages regular walking for adults. A practical step is to add short walks toward the 10,000-step reference on file. This does not replace a clinician activity prescription.`,
      guideline: "Manger Bouger — PNNS",
      guideline_url: MANGER_BOUGER,
    });
  }

  if (member.age >= 18 && profile.bmi >= 25) {
    items.push({
      id: `${memberId}-bmi`,
      member_id: memberId,
      member_name: name,
      based_on: `BMI ${profile.bmi.toFixed(1)} from height and weight on file. WHO adult overweight threshold is 25.`,
      title: "BMI on file — food pattern, not a diet order",
      body: `BMI is a screening number, not a diagnosis. PNNS emphasises vegetables, pulses, less ultra-processed food, and walking. Any weight plan should be agreed with the GP, especially with blood pressure and lipids on file.`,
      guideline: "Manger Bouger — PNNS",
      guideline_url: MANGER_BOUGER,
    });
  }

  const order = [
    "allergy",
    "tobacco",
    "hba1c",
    "bp",
    "lipid",
    "iron",
    "vax",
    "bmi",
    "sleep",
    "steps",
  ];
  items.sort((a, b) => {
    const ka = order.findIndex((k) => a.id.endsWith(`-${k}`));
    const kb = order.findIndex((k) => b.id.endsWith(`-${k}`));
    return (ka === -1 ? 99 : ka) - (kb === -1 ? 99 : kb);
  });
  return items;
}

export function familyCompanionAdvice(): {
  summary: string;
  items: CompanionAdviceItem[];
} {
  const members = getDataset().members;
  const perMember = members.map((m) => ({
    member: m,
    items: companionAdviceForMember(m.id),
  }));

  const adults = perMember.filter((x) => x.member.age >= 18 && x.items.length);
  const children = perMember.filter((x) => x.member.age < 18 && x.items.length);

  const summary =
    `Household records on file cluster into two everyday themes: ` +
    `cardiometabolic follow-up for ${adults.map((x) => x.member.display_name).join(" and ") || "the adults"}, ` +
    `and allergy preparedness plus the childhood immunisation calendar for ` +
    `${children.map((x) => x.member.display_name).join(" and ") || "the children"}. ` +
    `These are general practice recommendations drawn from French official guidance. ` +
    `They are not a diagnosis, not a prescription, and they sit beside — not instead of — your physicians.`;

  const items = perMember.flatMap((x) => x.items.slice(0, 2));
  return { summary, items };
}
