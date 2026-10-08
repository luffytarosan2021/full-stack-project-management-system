import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

const originList = z
  .string()
  .trim()
  .min(1, "CLIENT_ORIGIN must list at least one origin")
  .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean))
  .refine(
    (origins) =>
      origins.length > 0 &&
      origins.every((origin) => {
        try {
          const url = new URL(origin);
          return ["http:", "https:"].includes(url.protocol) && url.origin === origin;
        } catch {
          return false;
        }
      }),
    "CLIENT_ORIGIN must be a comma-separated list of http(s) origins without paths (no \"*\")",
  );

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().int().min(1).max(65535),
  DATABASE_URL: z
    .string()
    .trim()
    .regex(/^(mysql|mariadb):\/\//, "DATABASE_URL must be a mysql:// or mariadb:// connection string"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z
    .string()
    .trim()
    // A unit is required: jsonwebtoken reads a bare numeric string as milliseconds.
    .regex(/^\d+[smhdwy]$/, "JWT_EXPIRES_IN must be a number with a unit, like 7d or 30s"),
  CLIENT_ORIGIN: originList,
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const problems = result.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${problems}`);
}

export const env = Object.freeze(result.data);
