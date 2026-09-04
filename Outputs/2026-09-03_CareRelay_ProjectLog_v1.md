# CareRelay Project Log

Living source of truth for the CareRelay MVP. Append every later data or code change to **Changelog**. Do not overwrite prior entries.

- Project: CareRelay MVP — Family Health Timeline & Care Loops
- Started: 2026-09-03
- Operator: Javier
- Locale of dataset: Copenhagen, Denmark
- Demo “today”: 2026-09-03

---

## Vision

Connect fragmented family health information into one timeline. Identify what happened, what is happening, and what needs to happen next.

CareRelay organises evidence and actions. Clinicians make medical decisions.

## Core principles

1. Organisation, not diagnosis.
2. Transparency over automation. Show gaps; never present missing data as proof of failure.
3. Source-linked facts. Every clinical statement connects to a source document. Device data is always labelled as such.
4. User confirmation. Never auto-save extracted or detected information.
5. Safe wording. “CareRelay has no evidence of…” not “You failed to…”. “Official guidance may apply” not “You medically need…”.

---

## MVP scope (single decisive interaction)

Upload → confirm extraction → timeline (clinical + device) → incomplete care loop → doctor brief.

### User journey

1. Upload medical document (blood analysis PDF, consultation note).
2. CareRelay extracts medical event and links to source.
3. User confirms extracted information.
4. Connect simulated device data (Apple Health).
5. Timeline shows clinical + device-reported information.
6. CareRelay identifies incomplete care loop.
7. User sees options: Book lab | Add appointment | Ask doctor | Dismiss.
8. CareRelay generates Doctor Brief (source-linked summary).
9. Show one official-guidance notification (simplified, labelled as demo).

### What we will not build (MVP)

- Real LLM document extraction (hardcoded mock only).
- Real Apple Health / Garmin connections.
- Advanced charts, nutrition, medication management.
- Database, auth, clinician dashboard, mobile app.
- Real official guidance feed (one demo notification).
- Wearable trend analysis or predictions.
- Automatic test ordering or dosage changes.

---

## Reviewer demonstration path

1. Home shows 4 family members.
2. Click **Marco, age 40** → timeline.
3. Timeline shows: hypertension visit, lipid panel (`l_0007`), device events (elevated temp and other device-reported context).
4. Care Loops: “Repeat blood analysis due in 10 days. No appointment found.”
5. Prepare Appointment → Doctor Brief (HTML) → print / save as PDF.
6. Anomalies: 6 seeded errors flagged, click-through to source record.
7. Official Guidance mockup: vaccination may be due; labelled demo.

Note: original brief said “Marco, age 46”. Dataset DOB is 1986-03-14. Decision: keep DOB; demo uses age 40.

---

## Safety guardrails (required copy)

| Kind | Label |
|---|---|
| Clinical fact | From [source document] |
| Device metric | Device-reported (not medical diagnosis) |
| Official guidance | Source: [authority], Country: [jurisdiction] |
| Missing data | No record found (never “test was skipped”) |

Forbidden: AI diagnosis, automatic ordering, wearable trend → clinical conclusion, device data overriding clinical record, medication/dosage changes.

---

## Original data brief vs file on disk

**Specified:** `family_health_dataset.json`, 4 members, 168 records, 2024–2026.

**Received:** `/Users/umbraco-javier/Downloads/family_health_dataset.xlsx` (copied to `data/source/`). Generated 2026-09-03, seed 4271.

| Table | Rows |
|---|---|
| Members | 4 |
| Doctor visits | 28 |
| Dental visits | 29 (extra vs JSON spec; kept) |
| Labs | 28 |
| Vaccinations | 42 |
| Device monthly | 108 |
| Device events | 14 |
| Anomalies | 6 |

### Members (raw xlsx)

| ID | Role | DOB | Sex | Height | Weight |
|---|---|---|---|---|---|
| m_001 | father | 1986-03-14 | M | 182 | 84 |
| m_002 | mother | 1986-09-02 | F | 169 | 66 |
| m_003 | son | 2019-05-21 | M | 125 | 26 |
| m_004 | daughter | 2021-02-08 | F | 111 | 18 |

No display names in source. Device: father Oura + Withings (33 months each); mother Apple Watch (33 months); son Garmin kids (9 months).

### Data QA (xlsx vs spec) — 2026-09-03

| Seeded item | Spec / sheet | Finding |
|---|---|---|
| Overdue follow-up `v_0005` | status overdue, FU 2025-06-15 | True, but `Follow-up Required = false`. Topic is muscle strain. Same calendar day as hypertension visit `v_0003`. |
| Unflagged abnormal | Sheet: `l_0008`. Spec: `l_0010` | `l_0008` is HbA1c “within expected range”. `l_0010` is elevated LDL. No analyte flag field in xlsx. |
| Near-duplicate `d_0028`/`d_0029` | Same member, 1 day apart | False. Different people, 2 months apart. Real pair: `d_0006` / `d_0029` (father, 1–2 Jul 2024). |
| Missing interpretation `l_0009` | null interpretation | False. Interpretation filled. Date is future (2026-10-01). |
| Low completeness `dm_0031` | father 2026-02 = 42% | No `dm_*` id column. 42% is father Oura **2024-11**. Father 2026-02 is 85%. |
| Past-due booster `vac_0011` | booster_due, next 2025-01-01 | True. |
| Repeat blood analysis due in 10 days | Demo script | Missing. Closest future FU: son `v_0021` on 2026-09-19. |
| Names / Marco 46 | Demo script | No names. Father is 40. |
| Source documents | Spec | Missing except vaccination `Source`. |
| `linked_lab_ids` / `linked_visit_id` | Spec | Missing. |
| Nested analytes | Spec `is_abnormal_lab` | Missing. |

Other quality notes (not patched unless listed below): Withings rows carry sleep/HR/steps; father `v_0007` is a paediatrician “Medication review”; many recommendations are filler text.

---

## Decisions (locked 2026-09-03)

- Use the xlsx. Convert + **minimal patch**. Do not regenerate the family from scratch.
- Names: **Marco** (father, 40), **Sofie** (mother, 40), **Lukas** (son, 7), **Emma** (daughter, 5). DOBs unchanged.
- Make the Anomalies table true with the smallest edits. Retarget dental pair to `d_0006`/`d_0029`. Do not rewrite Emma’s `d_0028`.
- Add one new father care loop: lipid retest due **2026-09-13**.
- Next.js 14 App Router (`src/app`). API as Route Handlers. Same URLs as the spec.
- Scaffold in `CareRelay/` workspace root. Do not touch `Untitled spreadsheet.gsheet`.
- PDF via print CSS + `window.print()`.
- No LLM, no real Apple Health, no database, no auth.
- Vercel deploy is out of the first build pass.
- If Google Drive + `node_modules` makes `next dev` unusable: stop and recommend a local clone. Do not silently move the project.

---

## Data patches applied

Filled during convert. See Changelog for the dated entry.

| Item | Action |
|---|---|
| Names | Marco / Sofie / Lukas / Emma + `avatar_seed` |
| `v_0005` | `follow_up_required: true` |
| `anom_002` | Point to `l_0010`. Add LDL analyte `flag: high`. `linked_visit_id: null`. |
| Dental | Anomaly retargeted to `d_0006` / `d_0029`. Emma `d_0028` unchanged. |
| `l_0009` | `interpretation: null`. Future date 2026-10-01 kept (data quirk). |
| Completeness | Father Oura 2026-02 set to 42%. That row `id: dm_0031`. 2024-11 42% left as-is. |
| `vac_0011` | No change. |
| New care loop | Marco follow-up from lipid/`l_0007`: `follow_up_date: 2026-09-13`, no later lab or appointment. |
| Source stubs | `source_document` on clinical rows. |
| Lab analytes | `analytes[]` on labs; required on `l_0010`. |
| Device monthly ids | `dm_0001`…; `dm_0031` reserved for the patched 2026-02 Oura row. |
| Links | `linked_visit_id` / `linked_lab_ids` where inferable; otherwise null. |

---

## Architecture

- Frontend: Next.js 14, TypeScript, React 18, Tailwind, shadcn/ui, date-fns, Zod.
- Backend: App Router Route Handlers. In-memory JSON store loaded from `src/data/family_health_dataset.json`.
- Uploads: confirmed extractions stay in memory; cleared on restart.
- Extraction: hardcoded mock of `l_0007` (Marco lipid panel).
- Device connect: loads Sofie’s `apple_watch` monthly series.

### Routes

| Path | Purpose |
|---|---|
| `/` | Family selector |
| `/members/[id]` | Member dashboard + timeline |
| `/upload` | Document upload (step 1) |
| `/confirm-extraction` | Confirm extracted fields (step 2) |
| `/connect-device` | Simulated Apple Health |
| `/care-loops/[member_id]` | Open actions |
| `/doctor-brief/[member_id]` | Pre-appointment brief + print |
| `/guidance` | Official guidance (demo) |
| `/anomalies` | All 6 seeded flags |

### API

- `GET /api/members`
- `GET /api/members/[id]`
- `GET /api/timeline/[member_id]`
- `GET /api/care-loops/[member_id]`
- `POST /api/upload`
- `POST /api/confirm-extraction`
- `GET /api/doctor-brief/[member_id]`
- `GET /api/anomalies/[member_id]`
- `GET /api/guidance`

---

## File map (as built)

- `data/source/family_health_dataset.xlsx` — unmodified copy of the received workbook
- `scripts/convert-dataset.py` — xlsx → patched JSON
- `src/data/family_health_dataset.json` — runtime dataset
- `src/types/index.ts`
- `src/utils/data.ts`, `timeline.ts`, `careloops.ts`, `extraction.ts`, `validation.ts`
- `src/app/*` — routes and API
- `src/components/*`

---

## Open questions / assumptions

- Assumption: “today” for due-date math is **2026-09-03** (session date), not the machine clock, so the 10-day lipid loop stays stable.
- Assumption: display names are synthetic and are not Javier’s real family.
- `l_0009` remaining future-dated with null interpretation is intentional after the missing-interpretation patch.
- Father Oura 2024-11 also has 42% completeness; only 2026-02 is the seeded `dm_0031` flag.
- Deploy to Vercel is deferred.

---

## Changelog

Append-only. Newest at the bottom.

### 2026-09-03 — Project log created

- Created this file from the original MVP brief, xlsx QA, and locked build decisions.
- README points here.
- Code and patched JSON not yet written at the time of this first entry.

### 2026-09-03 — Dataset converted and patched

- Copied xlsx to `data/source/family_health_dataset.xlsx` (original left in Downloads).
- Added `scripts/convert-dataset.py` → `src/data/family_health_dataset.json`.
- Names: Marco / Sofie / Lukas / Emma. Ages from demo today 2026-09-03: 40 / 40 / 7 / 5.
- `v_0005.follow_up_required` set true.
- `anom_002` retargeted to `l_0010` with LDL analyte `flag: high` and `linked_visit_id: null`.
- `anom_003` retargeted to `d_0029` with related `d_0006`. Emma `d_0028` unchanged.
- `l_0009.interpretation` set null. Future date 2026-10-01 kept.
- Father Oura 2026-02 completeness set to 42%; row id `dm_0031`. 2024-11 42% left as-is.
- Added visit `v_0029` (2025-03-15, lipid panel review) linked to `l_0007`, follow-up 2026-09-13, status scheduled. Demo care loop.
- Source-document stubs added on clinical rows. Device monthly ids assigned (`dm_0031` reserved).
- Embedded one Denmark vaccination-programme guidance record (`guide_001`).

### 2026-09-03 — MVP app shipped (local)

- Scaffolded Next.js 14.2 App Router in `CareRelay/` with Tailwind and local UI primitives (shadcn-style).
- In-memory store + API routes for members, timeline, care loops, upload/confirm, device connect, doctor brief, anomalies, guidance.
- Reviewer path verified in browser: family → Marco timeline → care loops (repeat blood analysis, 10 days) → doctor brief → 6 anomalies → official guidance (demo) → upload/confirm `l_0007` → Apple Health connect page.
- Production `next build` succeeded. Dev server: `npm run dev` → http://localhost:3000
- Node is not on the default PATH on this Mac. This session used `/Users/umbraco-javier/.local/node` (v20.19.5).
- `node_modules` landed on the Drive folder after `npm install` replaced a symlink. If `next dev` becomes slow, move `node_modules` off Drive.
- Vercel deploy still deferred.

### 2026-09-04 — Family dashboard and patient vitals (v1.1)

- Header nav is Family only. `/anomalies`, `/guidance`, `/upload`, `/connect-device` remain as URLs.
- Added `health_profiles` for all four members (7-day sleep/steps, BMI, BP, resting HR, conditions, medications, CareRelay index).
- Source-linked new records: `v_0030` Marco BP review + smoking status; `v_0031` Sofie type 2 diabetes review; `l_0029` Sofie HbA1c 7.4% (older `l_0008` unchanged).
- Family home: pulse tiles, household alerts, next appointments, member cards with index.
- Patient page: KPIs, conditions, medication history, in-page upload, five simulated device buttons (Apple Watch, Whoop, Oura, BP monitor, glucose monitor). No device charts.
- CareRelay index is stored, not live-computed. Formula (documented, not a diagnosis): 100 −10 smoker −8 chronic (allergy −4) −8 adult systolic ≥140 −4 adult BMI ≥25 −5 sleep <70 −6 each overdue loop. Stored values: Marco 61, Sofie 74, Lukas 89, Emma 87.
- Device connect API is per `member_id` + `device`.

### 2026-09-04 — Family board (v2)

- Home is now one member-card grid, then **Attention**, then **Appointment**. Dropped Alerts, Family pulse, and the duplicate Members block.
- Member cards: mixed-race portraits in `public/avatars/`, age, blood type (Marco A+, Sofie O+, Lukas A+, Emma O+), semicircle CareRelay index (50–100, red→green). Index copy: not a medical diagnosis.
- Attention = gaps only: Marco lipid follow-up `v_0029` has `booking_status: missing`; med dates within 30 days of 2026-09-03 (Marco amlodipine refill 10 Sep, Sofie metformin refill 20 Sep, Emma epinephrine expiry 1 Oct). Lukas epinephrine expiry 15 Nov is on file but outside the horizon.
- Appointment = confirmed bookings only (`v_0021` Lukas 19 Sep, `v_0031` Sofie 18 Dec) with demo Book / Reschedule. Copy: CareRelay does not book appointments.
- Converter patches: `blood_type`, `avatar_url`, `booking_status`, `refill_due` / `expiry_date`. Helpers: `familyAttention()`, `familyBookedAppointments()`.
- Portraits are synthetic. No diagnosis. Patient timeline, care loops, and doctor brief unchanged.

### 2026-09-04 — Patient page and physicians (v3)

- Home (L0): **Physicians** roster after member cards. Curated (xlsx provider types are inconsistent): Dr. Sofia Andersen GP (all four); Dr. Lars Jensen internal medicine (Marco, Sofie); Dr. Per Kristensen paediatrics (Lukas, Emma); Dr. Anna Larsen allergy and immunology (Lukas, Emma). Copy: on file from visit records, not a referral.
- Member page (L1): KPI **target bars**. Sleep 90 and steps 10,000: red below, yellow within 5% under, green at or over. BMI / BP / RHR invert so high values are not green. Adult BMI target 22 (WHO 18.5–24.9); child BMI estimates Lukas 15.8 / Emma 15.2. Adult BP 120/80; child BP 105/65 and 100/60. Adult RHR 50; child RHR 80. Reference targets, not a diagnosis.
- Upload: **Extract document** (existing `l_0007`) and **Extract medication** (Marco amlodipine / Sofie metformin / child’s epinephrine). Confirm required. Does not change dose.
- Timeline: **Document** opens a synthetic stub at `/source`. Device rows: no source document on file.
- Donor category by donation type (not eligibility): Marco multi-organ deceased; Sofie tissue and cornea; Lukas haematopoietic with parental consent; Emma deferred to majority.
- Converter: `physicians`, `donor_profile`.

### 2026-09-04 — Jensen Smith Family, Calendar (v4)

- Home title is **Jensen Smith Family**. Dropped the household/demo-date subtitle.
- Member cards: Donor Yes/No (Emma No), condition chips, gradient index (50 red → 75 amber → 100 green).
- Home order: cards → Attention (Take action) → Appointment (Reschedule + Prepare appointment) → Physicians.
- Physicians: portraits, hospital, phone, Make appointment (demo). Dropped “not a referral” copy.
- Member page: portrait with condition/allergy/med chips; large gauge; **Urgent actions** (loops + Prepare appointment); donor box below KPI bars. Removed source-heavy conditions/meds cards and header Care loops / Prepare buttons.
- KPI bars use the same faded 50/75/100 gradient.
- Nav: Family | Calendar. Calendar is 2026 only, colour-coded by member (Marco teal, Sofie rose, Lukas sky, Emma amber). Doctor visits, follow-ups, and dental dates.
- No diagnosis. CareRelay does not book appointments.

### 2026-09-04 — CareNest, France, brand (v5)

- Product name is **CareNest**. Tagline: Family health in one place. Logo at `public/carenest-logo.png`.
- Target market is France. Dataset locale `Paris, France`. Physicians: Cabinet médical Passy, Hôpital Bichat-Claude-Bernard, Hôpital Necker-Enfants Malades, Hôpital Saint-Louis, +33 numbers. Dental clinics mapped to Saint-Germain, Passy, Étoile. Guidance: Santé publique France.
- Look and feel from the logo: cream page, peach borders, magenta primary, gold calendar accent for Sofie. English UI unchanged. Family names unchanged.
- User-facing copy says CareNest. Does not diagnose. Does not book appointments.

### 2026-09-04 — AI medical companion advice (v6)

- New section **AI medical companion advice** on L0 (after member cards) and L1 (after the profile header).
- Mock companion: general practice recommendations from French official guidance (HAS, Santé publique France, Manger Bouger, Ameli). Not clinical advice, not a diagnosis, not a prescription.
- L1 items are tailored from on-file labs and profiles (Marco: lipids, BP, tobacco, sleep, BMI; Sofie: HbA1c, lipids, iron, steps; Lukas and Emma: egg allergy and childhood calendar).
- L0 aggregates a household summary plus the first two items per member.
- Placement: L0 below Physicians; L1 below Upload document or medication.

### 2026-09-04 — Portal landing (v6.1)

- New `/portal` landing: family photograph, CareNest logo, tagline, one **Log in** button (opens Family).
- Nav order is Portal | Family | Calendar. Disclaimer banner is hidden on Portal.


### 2026-09-04 — Doctor companion label

- User-facing companion badge and disclaimer say **Doctor companion** (was Mock companion). Disclaimer otherwise unchanged.

### 2026-09-04 — Portal: Log in only on photo

- Portal hero is the family photo with a single magenta **Log in** button (no white card, no logo overlay). Header nav unchanged.

### 2026-09-04 — Portal Log in below faces

- Moved the magenta **Log in** button from vertical center to the bottom of the family hero (`absolute inset-0` + `items-end`) so the children’s faces stay visible. No card, no logo overlay.

### 2026-09-04 — L1 BMI and resting HR bars

- BMI and avg resting heart rate bars use a reversed gradient (green at low, red at high). Sleep, steps, and blood pressure unchanged.
