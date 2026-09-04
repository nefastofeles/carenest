import { z } from "zod";

export const uploadSchema = z.object({
  member_id: z.string().optional(),
  filename: z.string().optional(),
  kind: z.enum(["lab", "medication"]).optional(),
});

export const confirmSchema = z.object({
  kind: z.enum(["lab", "medication"]),
  lab_id: z.string().optional(),
  medication_id: z.string().optional(),
  member_id: z.string(),
});

export const dismissSchema = z.object({
  loop_id: z.string(),
});

export const guidanceDecisionSchema = z.object({
  guidance_id: z.string(),
  action: z.enum(["confirm", "discuss_with_doctor", "dismiss"]),
  reason: z.string().optional(),
});

export const connectDeviceSchema = z.object({
  member_id: z.string(),
  device: z.enum([
    "apple_watch",
    "whoop",
    "oura_ring",
    "blood_pressure_monitor",
    "glucose_monitor",
  ]),
});
