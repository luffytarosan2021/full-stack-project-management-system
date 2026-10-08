import { z } from "zod";

export const requiredString = (label) =>
  z.string({
    error: (issue) => (issue.input === undefined ? `${label} is required` : `${label} must be a string`),
  });

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Real calendar dates only: JavaScript would silently roll 2026-02-30 over to March 2.
export const isRealDate = (value) => {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const dateOnly = (label) =>
  requiredString(label)
    .regex(DATE_PATTERN, `${label} must be in YYYY-MM-DD format`)
    .refine((value) => !DATE_PATTERN.test(value) || isRealDate(value), `${label} must be a real calendar date`);

// Optional text: trimmed; "", whitespace-only and null all become null.
export const nullableText = (label, max) =>
  z
    .union([z.string({ error: `${label} must be a string` }).trim().max(max, `${label} must be at most ${max} characters`), z.null()], {
      error: `${label} must be a string`,
    })
    .transform((value) => (value === "" ? null : value));

export const uuidParam = (label) => z.uuid(`${label} must be a valid UUID`);

// Query values: repeated parameters arrive as arrays and are rejected; empty values mean "no filter".
export const optionalQueryString = (label) =>
  z
    .string({ error: `${label} must be provided at most once` })
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value));
