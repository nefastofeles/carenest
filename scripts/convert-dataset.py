#!/usr/bin/env python3
"""Convert family_health_dataset.xlsx to patched runtime JSON."""

from __future__ import annotations

import json
import re
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
R_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
TODAY = date(2026, 9, 3)
ROOT = Path(__file__).resolve().parents[1]
XLSX = ROOT / "data" / "source" / "family_health_dataset.xlsx"
OUT = ROOT / "src" / "data" / "family_health_dataset.json"

DISPLAY_NAMES = {
    "m_001": "Marco",
    "m_002": "Sofie",
    "m_003": "Lukas",
    "m_004": "Emma",
}

BLOOD_TYPES = {
    "m_001": "A+",
    "m_002": "O+",
    "m_003": "A+",
    "m_004": "O+",
}

BOOKING_STATUS = {
    "v_0021": "booked",
    "v_0029": "missing",
    "v_0031": "booked",
}

DONOR_PROFILES = {
    "m_001": {
        "registered": True,
        "category": "Multi-organ (deceased)",
        "donation_types": [
            "heart",
            "lungs",
            "liver",
            "kidneys",
            "pancreas",
            "tissue",
        ],
        "detail": "Full deceased-donor registry on file.",
    },
    "m_002": {
        "registered": True,
        "category": "Tissue and cornea only",
        "donation_types": ["cornea", "skin", "bone", "heart valves"],
        "detail": "Restricted tissue and cornea registry on file.",
    },
    "m_003": {
        "registered": True,
        "category": "Haematopoietic",
        "donation_types": ["bone marrow", "stem cells"],
        "detail": "Parental consent on file for marrow / stem-cell registry.",
    },
    "m_004": {
        "registered": False,
        "category": "Deferred to majority",
        "donation_types": [],
        "detail": "No organ-donor registration on file.",
    },
}

CLINIC_MAP = {
    "Smile Dental": "Cabinet dentaire Saint-Germain",
    "Tandlægeklinikken Amagerbro": "Cabinet dentaire Passy",
    "Tandareal København": "Centre dentaire de l'Étoile",
}

PHYSICIANS = [
    {
        "id": "phys_001",
        "name": "Dr. Sofia Andersen",
        "specialty": "General practice",
        "hospital": "Cabinet m\u00e9dical Passy",
        "phone": "+33 1 42 88 10 20",
        "avatar_url": "/physicians/phys_001.png",
        "patient_ids": ["m_001", "m_002", "m_003", "m_004"],
    },
    {
        "id": "phys_002",
        "name": "Dr. Lars Jensen",
        "specialty": "Internal medicine",
        "hospital": "H\u00f4pital Bichat-Claude-Bernard",
        "phone": "+33 1 40 25 80 80",
        "avatar_url": "/physicians/phys_002.png",
        "patient_ids": ["m_001", "m_002"],
    },
    {
        "id": "phys_003",
        "name": "Dr. Per Kristensen",
        "specialty": "Paediatrics",
        "hospital": "H\u00f4pital Necker-Enfants Malades",
        "phone": "+33 1 44 49 40 00",
        "avatar_url": "/physicians/phys_003.png",
        "patient_ids": ["m_003", "m_004"],
    },
    {
        "id": "phys_004",
        "name": "Dr. Anna Larsen",
        "specialty": "Allergy and immunology",
        "hospital": "H\u00f4pital Saint-Louis",
        "phone": "+33 1 42 49 49 49",
        "avatar_url": "/physicians/phys_004.png",
        "patient_ids": ["m_003", "m_004"],
    },
]


def col_row(cell_ref: str) -> tuple[int, int]:
    m = re.match(r"([A-Z]+)(\d+)", cell_ref)
    if not m:
        raise ValueError(cell_ref)
    n = 0
    for ch in m.group(1):
        n = n * 26 + (ord(ch) - 64)
    return n, int(m.group(2))


def cell_value(c: ET.Element):
    t = c.attrib.get("t")
    v = c.find("m:v", NS)
    is_el = c.find("m:is", NS)
    if t == "inlineStr" and is_el is not None:
        return "".join(t2.text or "" for t2 in is_el.findall(".//m:t", NS))
    if v is None or v.text is None:
        return None
    if t == "b":
        return v.text == "1"
    if t in ("s", "str"):
        return v.text
    try:
        if "." in v.text or "e" in v.text.lower():
            return float(v.text)
        return int(v.text)
    except ValueError:
        return v.text


def read_sheet(zf: zipfile.ZipFile, target: str) -> list[dict]:
    target = target.lstrip("/")
    key = target if target.startswith("xl/") else f"xl/{target}"
    root = ET.fromstring(zf.read(key))
    rows: dict[int, dict[int, object]] = defaultdict(dict)
    max_col = 0
    max_row = 0
    for c in root.findall(".//m:c", NS):
        ref = c.attrib.get("r")
        if not ref:
            continue
        col, row = col_row(ref)
        rows[row][col] = cell_value(c)
        max_col = max(max_col, col)
        max_row = max(max_row, row)
    headers = [rows.get(1, {}).get(i) for i in range(1, max_col + 1)]
    data = []
    for r in range(2, max_row + 1):
        rec = {}
        empty = True
        for i, h in enumerate(headers, 1):
            val = rows.get(r, {}).get(i)
            rec[h if h is not None else f"col_{i}"] = val
            if val not in (None, ""):
                empty = False
        if not empty:
            data.append(rec)
    return data


def load_workbook(path: Path) -> dict[str, list[dict]]:
    with zipfile.ZipFile(path) as zf:
        wb = ET.fromstring(zf.read("xl/workbook.xml"))
        sheets = []
        for sh in wb.findall("m:sheets/m:sheet", NS):
            sheets.append(
                {"name": sh.attrib.get("name"), "rid": sh.attrib.get(f"{R_NS}id")}
            )
        rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
        rid_to_target = {rel.attrib.get("Id"): rel.attrib.get("Target") for rel in rels}
        return {s["name"]: read_sheet(zf, rid_to_target[s["rid"]]) for s in sheets}


def slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "_", (text or "record").lower()).strip("_")
    return s or "record"


def source_stub(kind: str, record_id: str, label: str) -> str:
    return f"sources/{record_id}_{slug(label)}.pdf"


def age_years(dob: str) -> int:
    d = date.fromisoformat(dob)
    years = TODAY.year - d.year - ((TODAY.month, TODAY.day) < (d.month, d.day))
    return years


def infer_analytes(test_name: str, interpretation: str | None, lab_id: str) -> list[dict]:
    if lab_id == "l_0010":
        return [
            {
                "name": "LDL cholesterol",
                "value": None,
                "unit": None,
                "flag": "high",
                "note": "Elevated LDL recorded in interpretation. No structured clinician correlation visit.",
            }
        ]
    if not interpretation:
        return []
    low = interpretation.lower()
    analytes = []
    if "elevated ldl" in low:
        analytes.append(
            {
                "name": "LDL cholesterol",
                "value": None,
                "unit": None,
                "flag": "high",
                "note": "From narrative interpretation.",
            }
        )
    if "low ferritin" in low:
        analytes.append(
            {
                "name": "Ferritin",
                "value": None,
                "unit": None,
                "flag": "low",
                "note": "From narrative interpretation.",
            }
        )
    if "elevated specific ige" in low:
        analytes.append(
            {
                "name": "Specific IgE (egg white)",
                "value": None,
                "unit": None,
                "flag": "high",
                "note": "From narrative interpretation.",
            }
        )
    return analytes


def convert() -> dict:
    sheets = load_workbook(XLSX)

    members = []
    for row in sheets["Members"]:
        mid = row["ID"]
        members.append(
            {
                "id": mid,
                "role": row["Role"],
                "display_name": DISPLAY_NAMES[mid],
                "avatar_seed": DISPLAY_NAMES[mid].lower(),
                "dob": row["DOB"],
                "sex": row["Sex"],
                "height_cm": row["Height (cm)"],
                "weight_kg": row["Weight (kg)"],
                "age": age_years(row["DOB"]),
                "blood_type": BLOOD_TYPES[mid],
                "avatar_url": f"/avatars/{mid}.png",
                "donor_profile": DONOR_PROFILES[mid],
            }
        )

    doctor_visits = []
    for row in sheets["Doctor Visits"]:
        vid = row["Visit ID"]
        mid = row["Member ID"]
        topic = row.get("Topic") or "Consultation"
        follow_up_required = bool(row.get("Follow-up Required"))
        if vid == "v_0005":
            follow_up_required = True
        doctor_visits.append(
            {
                "visit_id": vid,
                "member_id": mid,
                "date": row["Date"],
                "provider_type": row.get("Provider Type"),
                "provider_name": row.get("Provider Name"),
                "topic": topic,
                "diagnosis": row.get("Diagnosis"),
                "recommendation": row.get("Recommendation"),
                "follow_up_required": follow_up_required,
                "follow_up_date": row.get("Follow-up Date"),
                "follow_up_status": row.get("Follow-up Status"),
                "linked_lab_ids": [],
                "source_document": source_stub("visit", vid, topic),
                "booking_status": BOOKING_STATUS.get(vid),
            }
        )

    # Demo care loop: lipid retest requested, due 2026-09-13, no later lab/appointment.
    doctor_visits.append(
        {
            "visit_id": "v_0029",
            "member_id": "m_001",
            "date": "2025-03-15",
            "provider_type": "gp",
            "provider_name": "Dr. Sofia Andersen",
            "topic": "Lipid panel review",
            "diagnosis": None,
            "recommendation": "Clinician requested repeat blood analysis after lifestyle trial. No appointment found in CareNest.",
            "follow_up_required": True,
            "follow_up_date": "2026-09-13",
            "follow_up_status": "scheduled",
            "linked_lab_ids": ["l_0007"],
            "source_document": source_stub("visit", "v_0029", "Lipid panel review"),
            "demo_seed": True,
            "booking_status": "missing",
        }
    )

    doctor_visits.append(
        {
            "visit_id": "v_0030",
            "member_id": "m_001",
            "date": "2026-08-20",
            "provider_type": "gp",
            "provider_name": "Dr. Sofia Andersen",
            "topic": "Blood pressure review and smoking status",
            "diagnosis": "Essential hypertension on file. Current smoker recorded.",
            "recommendation": "Amlodipine 5 mg daily continued as recorded. Smoking status noted. No cessation prescription on file.",
            "follow_up_required": False,
            "follow_up_date": None,
            "follow_up_status": "none",
            "linked_lab_ids": [],
            "source_document": source_stub(
                "visit", "v_0030", "Blood pressure review and smoking status"
            ),
        }
    )

    doctor_visits.append(
        {
            "visit_id": "v_0031",
            "member_id": "m_002",
            "date": "2026-06-18",
            "provider_type": "gp",
            "provider_name": "Dr. Lars Jensen",
            "topic": "Type 2 diabetes review",
            "diagnosis": "Type 2 diabetes mellitus, on file.",
            "recommendation": "Metformin 500 mg twice daily as recorded. Diet and activity as discussed in clinic. Repeat HbA1c per clinic schedule.",
            "follow_up_required": True,
            "follow_up_date": "2026-12-18",
            "follow_up_status": "scheduled",
            "linked_lab_ids": ["l_0029"],
            "source_document": source_stub("visit", "v_0031", "Type 2 diabetes review"),
            "booking_status": "booked",
        }
    )

    dental_visits = []
    for row in sheets["Dental Visits"]:
        did = row["Visit ID"]
        topic = row.get("Topic") or row.get("Visit Type") or "Dental visit"
        dental_visits.append(
            {
                "visit_id": did,
                "member_id": row["Member ID"],
                "date": row["Date"],
                "clinic": CLINIC_MAP.get(row.get("Clinic") or "", row.get("Clinic")),
                "visit_type": row.get("Visit Type"),
                "topic": topic,
                "treatment": row.get("Treatment"),
                "xray_taken": bool(row.get("X-ray Taken")),
                "recommendation": row.get("Recommendation"),
                "cost_dkk": row.get("Cost (DKK)"),
                "insurance_covered_dkk": row.get("Insurance Covered (DKK)"),
                "source_document": source_stub("dental", did, topic),
            }
        )

    lab_results = []
    for row in sheets["Lab Results"]:
        lid = row["Lab ID"]
        interpretation = row.get("Interpretation")
        if lid == "l_0009":
            interpretation = None
        linked_visit_id = None
        follow_up_date = None
        follow_up_status = None
        if lid == "l_0007":
            linked_visit_id = "v_0029"
            follow_up_date = "2026-09-13"
            follow_up_status = "scheduled"
        if lid == "l_0010":
            linked_visit_id = None
        lab_results.append(
            {
                "lab_id": lid,
                "member_id": row["Member ID"],
                "date": row["Date"],
                "category": row.get("Category"),
                "test_name": row.get("Test Name"),
                "ordering_reason": row.get("Ordering Reason"),
                "interpretation": interpretation,
                "action_taken": row.get("Action Taken"),
                "analytes": infer_analytes(row.get("Test Name") or "", interpretation, lid),
                "linked_visit_id": linked_visit_id,
                "follow_up_date": follow_up_date,
                "follow_up_status": follow_up_status,
                "source_document": source_stub("lab", lid, row.get("Test Name") or "lab"),
            }
        )

    lab_results.append(
        {
            "lab_id": "l_0029",
            "member_id": "m_002",
            "date": "2026-06-10",
            "category": "blood",
            "test_name": "HbA1c",
            "ordering_reason": "Type 2 diabetes monitoring",
            "interpretation": "HbA1c 7.4% recorded. Clinical correlation in linked visit.",
            "action_taken": "Reviewed in clinic. Metformin continued as recorded.",
            "analytes": [
                {
                    "name": "HbA1c",
                    "value": 7.4,
                    "unit": "%",
                    "flag": "high",
                    "note": "On file. Not a CareNest diagnosis.",
                }
            ],
            "linked_visit_id": "v_0031",
            "follow_up_date": None,
            "follow_up_status": None,
            "source_document": source_stub("lab", "l_0029", "HbA1c"),
        }
    )

    vaccinations = []
    for row in sheets["Vaccinations"]:
        vid = row["Vac ID"]
        vaccinations.append(
            {
                "vaccination_id": vid,
                "member_id": row["Member ID"],
                "date": row["Date"],
                "vaccine_name": row.get("Vaccine Name"),
                "disease_target": row.get("Disease Target"),
                "dose_number": row.get("Dose #"),
                "series_total": row.get("Series Total"),
                "series_status": row.get("Series Status"),
                "source": row.get("Source"),
                "next_dose_due": row.get("Next Dose Due"),
                "source_document": source_stub(
                    "vaccination", vid, row.get("Vaccine Name") or "vaccine"
                ),
            }
        )

    device_monthly = []
    seq = 1
    for row in sheets["Device Monthly"]:
        is_seed = (
            row.get("Member ID") == "m_001"
            and str(row.get("Month")).startswith("2026-02")
            and row.get("Device") == "oura_ring"
        )
        if is_seed:
            rec_id = "dm_0031"
        else:
            rec_id = f"dm_{seq:04d}"
            if rec_id == "dm_0031":
                seq += 1
                rec_id = f"dm_{seq:04d}"
            seq += 1
        completeness = row.get("Data Completeness (%)")
        if is_seed:
            completeness = 42
        device_monthly.append(
            {
                "id": rec_id,
                "month": row.get("Month"),
                "member_id": row["Member ID"],
                "device": row.get("Device"),
                "avg_sleep_hours": row.get("Avg Sleep (hrs)"),
                "sleep_efficiency_pct": row.get("Sleep Eff. (%)"),
                "avg_resting_hr": round(row["Avg Resting HR"], 1)
                if isinstance(row.get("Avg Resting HR"), (int, float))
                else row.get("Avg Resting HR"),
                "avg_hrv_ms": round(row["Avg HRV (ms)"], 1)
                if isinstance(row.get("Avg HRV (ms)"), (int, float))
                else row.get("Avg HRV (ms)"),
                "avg_steps": row.get("Avg Steps"),
                "active_min_per_week": row.get("Active Min/Week"),
                "vo2max": row.get("VO2max (ml/kg/min)"),
                "avg_weight_kg": row.get("Avg Weight (kg)"),
                "readiness_score": row.get("Readiness Score"),
                "data_completeness_pct": completeness,
            }
        )

    device_events = []
    for row in sheets["Device Events"]:
        eid = row["Event ID"]
        device_events.append(
            {
                "event_id": eid,
                "member_id": row["Member ID"],
                "date": row["Date"],
                "device": row.get("Device"),
                "event_type": row.get("Event Type"),
                "narrative": row.get("Narrative"),
                "label": "Device-reported (not medical diagnosis)",
            }
        )

    anomalies = []
    for row in sheets["Anomalies"]:
        aid = row["Anomaly ID"]
        table = row["Table"]
        record_id = row["Record ID"]
        typ = row["Type"]
        description = row["Description"]
        if aid == "anom_002":
            record_id = "l_0010"
            description = (
                "Lipid panel with high-flagged LDL analyte and no linked visit_id "
                "for clinical correlation (l_0010)."
            )
        if aid == "anom_003":
            record_id = "d_0029"
            description = (
                "Dental visit d_0029 is 1 day after d_0006 for the same member "
                "with identical treatment. Spec IDs d_0028/d_0029 did not match; "
                "Emma d_0028 left unchanged."
            )
        if aid == "anom_004":
            description = (
                "Lab record l_0009 has a null interpretation field. "
                "Date is 2026-10-01 (future relative to demo today 2026-09-03)."
            )
        if aid == "anom_005":
            description = (
                "Device data for father Oura ring (2026-02, dm_0031) with "
                "data_completeness_pct = 42%."
            )
        anomalies.append(
            {
                "id": aid,
                "table": table,
                "record_id": record_id,
                "related_record_ids": ["d_0006", "d_0029"] if aid == "anom_003" else [],
                "type": typ,
                "description": description,
                "severity": "needs_review",
            }
        )

    health_profiles = [
        {
            "member_id": "m_001",
            "as_of": "2026-09-03",
            "bmi": 25.4,
            "sleep_score_7d": 64,
            "steps_avg_7d": 9400,
            "resting_hr_avg": 72,
            "bp_systolic_avg": 142,
            "bp_diastolic_avg": 88,
            "health_index": 61,
            "current_smoker": True,
            "conditions": [
                {
                    "id": "cond_m001_htn",
                    "name": "Essential hypertension",
                    "status": "on_file",
                    "since": "2024-12-01",
                    "source_record": "v_0003",
                    "source_document": "sources/v_0003_hypertension_follow_up.pdf",
                },
                {
                    "id": "cond_m001_smoker",
                    "name": "Current smoker",
                    "status": "on_file",
                    "since": "2026-08-20",
                    "source_record": "v_0030",
                    "source_document": source_stub(
                        "visit", "v_0030", "Blood pressure review and smoking status"
                    ),
                },
            ],
            "medications": [
                {
                    "id": "med_m001_amlodipine",
                    "name": "Amlodipine",
                    "dose": "5 mg daily",
                    "started": "2026-08-20",
                    "status": "active",
                    "indication": "Blood pressure, as recorded by clinician",
                    "source_record": "v_0030",
                    "source_document": source_stub(
                        "visit", "v_0030", "Blood pressure review and smoking status"
                    ),
                    "refill_due": "2026-09-10",
                    "expiry_date": None,
                }
            ],
        },
        {
            "member_id": "m_002",
            "as_of": "2026-09-03",
            "bmi": 23.1,
            "sleep_score_7d": 78,
            "steps_avg_7d": 7100,
            "resting_hr_avg": 68,
            "bp_systolic_avg": 118,
            "bp_diastolic_avg": 76,
            "health_index": 74,
            "current_smoker": False,
            "conditions": [
                {
                    "id": "cond_m002_t2d",
                    "name": "Type 2 diabetes",
                    "status": "on_file",
                    "since": "2026-06-18",
                    "source_record": "v_0031",
                    "source_document": source_stub("visit", "v_0031", "Type 2 diabetes review"),
                },
                {
                    "id": "cond_m002_iron",
                    "name": "Iron-deficiency anaemia (prior episode on file)",
                    "status": "on_file",
                    "since": "2024-04-01",
                    "source_record": "v_0008",
                    "source_document": "sources/v_0008_fatigue_evaluation.pdf",
                },
            ],
            "medications": [
                {
                    "id": "med_m002_metformin",
                    "name": "Metformin",
                    "dose": "500 mg twice daily",
                    "started": "2026-06-18",
                    "status": "active",
                    "indication": "Type 2 diabetes, as recorded by clinician",
                    "source_record": "v_0031",
                    "source_document": source_stub("visit", "v_0031", "Type 2 diabetes review"),
                    "refill_due": "2026-09-20",
                    "expiry_date": None,
                },
                {
                    "id": "med_m002_ferrous",
                    "name": "Ferrous sulfate",
                    "dose": "325 mg daily with vitamin C",
                    "started": "2024-04-01",
                    "status": "active",
                    "indication": "Iron supplementation, as recorded by clinician",
                    "source_record": "v_0008",
                    "source_document": "sources/v_0008_fatigue_evaluation.pdf",
                    "refill_due": None,
                    "expiry_date": None,
                },
            ],
        },
        {
            "member_id": "m_003",
            "as_of": "2026-09-03",
            "bmi": 16.6,
            "sleep_score_7d": 86,
            "steps_avg_7d": 11200,
            "resting_hr_avg": 82,
            "bp_systolic_avg": 102,
            "bp_diastolic_avg": 64,
            "health_index": 89,
            "current_smoker": False,
            "conditions": [
                {
                    "id": "cond_m003_egg",
                    "name": "Egg allergy",
                    "status": "on_file",
                    "since": "2025-05-01",
                    "source_record": "l_0019",
                    "source_document": "sources/l_0019_specific_ige_panel.pdf",
                }
            ],
            "medications": [
                {
                    "id": "med_m003_epi",
                    "name": "Epinephrine auto-injector",
                    "dose": "As prescribed for emergency use",
                    "started": "2025-05-01",
                    "status": "active",
                    "indication": "Egg allergy, as recorded by clinician",
                    "source_record": "l_0019",
                    "source_document": "sources/l_0019_specific_ige_panel.pdf",
                    "refill_due": None,
                    "expiry_date": "2026-11-15",
                }
            ],
        },
        {
            "member_id": "m_004",
            "as_of": "2026-09-03",
            "bmi": 14.6,
            "sleep_score_7d": 88,
            "steps_avg_7d": 8600,
            "resting_hr_avg": 88,
            "bp_systolic_avg": 98,
            "bp_diastolic_avg": 62,
            "health_index": 87,
            "current_smoker": False,
            "conditions": [
                {
                    "id": "cond_m004_egg",
                    "name": "Egg allergy",
                    "status": "on_file",
                    "since": "2024-08-01",
                    "source_record": "l_0024",
                    "source_document": "sources/l_0024_specific_ige_panel.pdf",
                },
                {
                    "id": "cond_m004_wrist",
                    "name": "Wrist injury (recovered, on file)",
                    "status": "resolved_on_file",
                    "since": "2026-03-01",
                    "source_record": "v_0022",
                    "source_document": "sources/v_0022_wrist_injury_follow_up.pdf",
                },
            ],
            "medications": [
                {
                    "id": "med_m004_epi",
                    "name": "Epinephrine auto-injector",
                    "dose": "As prescribed for emergency use",
                    "started": "2026-01-01",
                    "status": "active",
                    "indication": "Egg allergy, as recorded by clinician",
                    "source_record": "v_0023",
                    "source_document": "sources/v_0023_allergy_assessment.pdf",
                    "refill_due": None,
                    "expiry_date": "2026-10-01",
                }
            ],
        },
    ]

    return {
        "meta": {
            "title": "Family Health Platform - Synthetic Dataset",
            "generated": "2026-09-03",
            "seed": 4271,
            "locale": "Paris, France",
            "demo_today": TODAY.isoformat(),
            "source_file": "data/source/family_health_dataset.xlsx",
            "patched": True,
        },
        "members": members,
        "physicians": PHYSICIANS,
        "doctor_visits": doctor_visits,
        "dental_visits": dental_visits,
        "lab_results": lab_results,
        "vaccinations": vaccinations,
        "device_monthly": device_monthly,
        "device_events": device_events,
        "seeded_anomalies": anomalies,
        "health_profiles": health_profiles,
        "guidance": [
            {
                "id": "guide_001",
                "type": "vaccination_programme",
                "authority": "Santé publique France",
                "country": "France",
                "date": "2026-01-15",
                "message": (
                    "Vaccination may be due according to the national childhood "
                    "immunisation calendar. CareNest has no matching record "
                    "for this dose. Review with your doctor or clinic."
                ),
                "link_to_official": "https://www.santepubliquefrance.fr/determinants-de-sante/vaccination",
                "user_actions": ["confirm", "discuss_with_doctor", "dismiss"],
                "demo": True,
                "applies_to_member_ids": ["m_003", "m_004"],
            }
        ],
    }


def main() -> None:
    dataset = convert()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(dataset, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    counts = {
        k: len(v) if isinstance(v, list) else v
        for k, v in dataset.items()
        if k != "meta"
    }
    print("Wrote", OUT)
    print(json.dumps(counts, indent=2))
    ids = [r["id"] for r in dataset["device_monthly"]]
    assert ids.count("dm_0031") == 1
    dm = next(r for r in dataset["device_monthly"] if r["id"] == "dm_0031")
    assert dm["data_completeness_pct"] == 42
    assert dm["month"] == "2026-02"
    v5 = next(r for r in dataset["doctor_visits"] if r["visit_id"] == "v_0005")
    assert v5["follow_up_required"] is True
    l9 = next(r for r in dataset["lab_results"] if r["lab_id"] == "l_0009")
    assert l9["interpretation"] is None
    l10 = next(r for r in dataset["lab_results"] if r["lab_id"] == "l_0010")
    assert l10["linked_visit_id"] is None
    assert any(a["flag"] == "high" for a in l10["analytes"])
    assert any(a["record_id"] == "l_0010" for a in dataset["seeded_anomalies"])
    assert any(a["record_id"] == "d_0029" for a in dataset["seeded_anomalies"])
    assert any(v["visit_id"] == "v_0029" for v in dataset["doctor_visits"])
    assert any(v["visit_id"] == "v_0030" for v in dataset["doctor_visits"])
    assert any(v["visit_id"] == "v_0031" for v in dataset["doctor_visits"])
    assert any(l["lab_id"] == "l_0029" for l in dataset["lab_results"])
    assert len(dataset["health_profiles"]) == 4
    marco = next(p for p in dataset["health_profiles"] if p["member_id"] == "m_001")
    assert marco["health_index"] == 61 and marco["current_smoker"] is True
    sofie = next(p for p in dataset["health_profiles"] if p["member_id"] == "m_002")
    assert sofie["health_index"] == 74
    assert len(dataset["physicians"]) == 4
    assert dataset["members"][0]["donor_profile"]["category"] == "Multi-organ (deceased)"
    assert dataset["members"][0]["donor_profile"]["registered"] is True
    assert dataset["members"][3]["donor_profile"]["registered"] is False
    assert dataset["physicians"][0]["hospital"] == "Cabinet médical Passy"
    assert dataset["meta"]["locale"] == "Paris, France"
    assert all(p["phone"].startswith("+33") for p in dataset["physicians"])
    assert dataset["guidance"][0]["country"] == "France"
    assert dataset["guidance"][0]["authority"] == "Santé publique France"
    danish_markers = ("Amager", "København", "Smile Dental", "Tandlæge", "Bispebjerg", "Rigshospital", "Gentofte")
    assert not any(
        any(m in (v.get("clinic") or "") for m in danish_markers)
        for v in dataset["dental_visits"]
    )
    print("Patch assertions OK")


if __name__ == "__main__":
    main()
