import { z } from "zod";
import { requiredString } from "./common.js";

const MAX_PASSWORD_BYTES = 72;
const MIN_PASSWORD_BYTES = 8;

const email = requiredString("Email")
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .pipe(z.email("Email must be a valid email address"));

const byteLength = (value) => Buffer.byteLength(value, "utf8");

export const registerSchema = z.object({
  fullName: requiredString("Full name")
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be at most 100 characters"),
  email: email.pipe(z.string().max(255, "Email must be at most 255 characters")),
  // Passwords are never trimmed; bcrypt only uses the first 72 bytes, so the limit is in bytes.
  password: requiredString("Password")
    .refine((value) => byteLength(value) >= MIN_PASSWORD_BYTES, "Password must be at least 8 characters")
    .refine((value) => byteLength(value) <= MAX_PASSWORD_BYTES, "Password must be at most 72 bytes"),
});

export const loginSchema = z.object({
  email,
  password: requiredString("Password").min(1, "Password is required"),
});
