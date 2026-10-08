import { z } from "zod";
import { isDateFormat, isRealDate } from "./dates.js";

// Dates stay plain "YYYY-MM-DD" strings end to end: no Date objects, no time zones (docs/VALIDATION.md section 6).
export const dateField = (label) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine(isDateFormat, `${label} must be in YYYY-MM-DD format`)
    .refine((value) => !isDateFormat(value) || isRealDate(value), `${label} must be a real calendar date`);

// Optional text: trimmed, and an empty value becomes null (which also clears it on update).
export const descriptionField = (max) =>
  z
    .string()
    .trim()
    .max(max, `Description must be at most ${max} characters`)
    .transform((value) => (value === "" ? null : value));

// PUT body with only the fields that differ from the saved record.
export function changedFields(saved, values, fields) {
  return Object.fromEntries(
    fields.filter((field) => values[field] !== (saved[field] ?? null)).map((field) => [field, values[field]]),
  );
}
