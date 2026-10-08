import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.url({ protocol: /^https?$/, error: "VITE_API_URL must be an http(s) URL" }),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(`Invalid web environment: ${parsed.error.issues.map((issue) => issue.message).join(", ")}`);
}

export const env = Object.freeze({
  apiUrl: parsed.data.VITE_API_URL.replace(/\/+$/, ""),
});
