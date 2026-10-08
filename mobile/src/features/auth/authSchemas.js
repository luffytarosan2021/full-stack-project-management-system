import { z } from "zod";

// Mirrors backend/src/validators/authValidators.js and docs/VALIDATION.md section 2.
const MIN_PASSWORD_BYTES = 8;
const MAX_PASSWORD_BYTES = 72;

const utf8Bytes = (value) => new TextEncoder().encode(value).length;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .pipe(z.email("Email must be a valid email address"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be at most 100 characters"),
  email: email.pipe(z.string().max(255, "Email must be at most 255 characters")),
  // Passwords are never trimmed; the limit is in bytes because bcrypt ignores anything past 72.
  password: z
    .string()
    .min(1, "Password is required")
    .refine((value) => utf8Bytes(value) >= MIN_PASSWORD_BYTES, "Password must be at least 8 characters")
    .refine((value) => utf8Bytes(value) <= MAX_PASSWORD_BYTES, "Password must be at most 72 bytes"),
});
