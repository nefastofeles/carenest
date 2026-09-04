export type DonorProfile = {
  registered: boolean;
  category: string;
  donation_types: string[];
  detail: string;
};

export type Member = {
  id: string;
  role: string;
  display_name: string;
  avatar_seed: string;
  dob: string;
  sex: string;
  height_cm: number;
  weight_kg: number;
  age: number;
  blood_type: string;
  avatar_url: string;
  donor_profile: DonorProfile;
};

export type Physician = {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  avatar_url: string;
  patient_ids: string[];
};

export type Analyte = {
  name: string;
  value: number | null;
  unit: string | null;
  flag: "high" | "low" | "normal" | null;
  note?: string;
};

export type DoctorVisit = {
  visit_id: string;
  member_id: string;
  date: string;
  provider_type: string | null;
  provider_name: string | null;
  topic: string;
  diagnosis: string | null;
  recommendation: string | null;
  follow_up_required: boolean;
  follow_up_date: string | null;
  follow_up_status: string | null;
  linked_lab_ids: string[];
  source_document: string;
  demo_seed?: boolean;
  booking_status?: "missing" | "booked" | null;
};

export type DentalVisit = {
  visit_id: string;
  member_id: string;
  date: string;
  clinic: string | null;
  visit_type: string | null;
  topic: string;
  treatment: string | null;
  xray_taken: boolean;
  recommendation: string | null;
  cost_dkk: number | null;
  insurance_covered_dkk: number | null;
  source_document: string;
};

export type LabResult = {
  lab_id: string;
  member_id: string;
  date: string;
  category: string | null;
  test_name: string;
  ordering_reason: string | null;
  interpretation: string | null;
  action_taken: string | null;
  analytes: Analyte[];
  linked_visit_id: string | null;
  follow_up_date: string | null;
  follow_up_status: string | null;
  source_document: string;
  user_confirmed?: boolean;
};

export type Vaccination = {
  vaccination_id: string;
  member_id: string;
  date: string;
  vaccine_name: string;
  disease_target: string | null;
  dose_number: number | null;
  series_total: number | null;
  series_status: string | null;
  source: string | null;
  next_dose_due: string | null;
  source_document: string;
};

export type DeviceMonthly = {
  id: string;
  month: string;
  member_id: string;
  device: string;
  avg_sleep_hours: number | null;
  sleep_efficiency_pct: number | null;
  avg_resting_hr: number | null;
  avg_hrv_ms: number | null;
  avg_steps: number | null;
  active_min_per_week: number | null;
  vo2max: number | null;
  avg_weight_kg: number | null;
  readiness_score: number | null;
  data_completeness_pct: number | null;
};

export type DeviceEvent = {
  event_id: string;
  member_id: string;
  date: string;
  device: string | null;
  event_type: string;
  narrative: string;
  label: string;
};

export type SeededAnomaly = {
  id: string;
  table: string;
  record_id: string;
  related_record_ids: string[];
  type: string;
  description: string;
  severity: string;
};

export type GuidanceItem = {
  id: string;
  type: string;
  authority: string;
  country: string;
  date: string;
  message: string;
  link_to_official: string;
  user_actions: string[];
  demo: boolean;
  applies_to_member_ids: string[];
};

export type OnFileCondition = {
  id: string;
  name: string;
  status: string;
  since: string;
  source_record: string;
  source_document: string;
};

export type OnFileMedication = {
  id: string;
  name: string;
  dose: string;
  started: string;
  status: string;
  indication: string;
  source_record: string;
  source_document: string;
  refill_due?: string | null;
  expiry_date?: string | null;
  user_confirmed?: boolean;
};

export type HealthProfile = {
  member_id: string;
  as_of: string;
  bmi: number;
  sleep_score_7d: number;
  steps_avg_7d: number;
  resting_hr_avg: number;
  bp_systolic_avg: number;
  bp_diastolic_avg: number;
  health_index: number;
  current_smoker: boolean;
  conditions: OnFileCondition[];
  medications: OnFileMedication[];
};

export type FamilyAlert = {
  id: string;
  member_id: string;
  member_name: string;
  title: string;
  detail: string;
  href: string;
};

export type AttentionItem = {
  id: string;
  member_id: string;
  member_name: string;
  title: string;
  detail: string;
  href: string;
  kind: "missing_booking" | "medication";
  date: string;
};

export type NextAppointment = {
  member_id: string;
  member_name: string;
  date: string;
  topic: string;
  status: string;
  record_id: string;
  note: string;
  booking_status?: "missing" | "booked" | null;
};

export type DeviceKind =
  | "apple_watch"
  | "whoop"
  | "oura_ring"
  | "blood_pressure_monitor"
  | "glucose_monitor";

export type Dataset = {
  meta: {
    title: string;
    generated: string;
    seed: number;
    locale: string;
    demo_today: string;
    source_file: string;
    patched: boolean;
  };
  members: Member[];
  physicians: Physician[];
  doctor_visits: DoctorVisit[];
  dental_visits: DentalVisit[];
  lab_results: LabResult[];
  vaccinations: Vaccination[];
  device_monthly: DeviceMonthly[];
  device_events: DeviceEvent[];
  seeded_anomalies: SeededAnomaly[];
  health_profiles: HealthProfile[];
  guidance: GuidanceItem[];
};

export type TimelineEventType =
  | "doctor_visit"
  | "dental_visit"
  | "lab"
  | "vaccination"
  | "device_event"
  | "device_monthly";

export type TimelineEvent = {
  id: string;
  member_id: string;
  date: string;
  type: TimelineEventType;
  title: string;
  summary: string;
  provider?: string | null;
  source_label: string;
  source_document?: string | null;
  flag: boolean;
  anomaly_ids: string[];
  category: TimelineEventType;
};

export type CareLoopAction = {
  id: string;
  member_id: string;
  type: string;
  title: string;
  due_date: string | null;
  days_until_due: number | null;
  status: string;
  detail: string;
  record_id: string;
  table: string;
  action_options: string[];
  is_demo_seed: boolean;
};

export type ExtractedKind = "lab" | "medication";

export type ExtractedDocument = {
  kind: ExtractedKind;
  member_id: string;
  member_name: string;
  test_name: string;
  date: string;
  result: string;
  doctor_instruction: string;
  source_document: string;
  lab_id?: string;
  medication_id?: string;
  confidence: number;
  requires_confirmation: true;
};

export type MemberSummary = Member & {
  total_visits: number;
  total_labs: number;
  total_vaccinations: number;
  open_care_loops: number;
  needs_review: number;
  health_index: number | null;
  flag_line: string;
  next_appointment_date: string | null;
};

export type GuidanceDecision = {
  guidance_id: string;
  action: "confirm" | "discuss_with_doctor" | "dismiss";
  reason?: string;
};

export type CompanionAdviceItem = {
  id: string;
  member_id: string;
  member_name: string;
  based_on: string;
  title: string;
  body: string;
  guideline: string;
  guideline_url: string;
};
