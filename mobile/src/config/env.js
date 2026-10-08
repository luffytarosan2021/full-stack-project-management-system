import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.url({ protocol: /^https?$/, error: "EXPO_PUBLIC_API_URL must be an http(s) URL" }),
});

// Expo only inlines EXPO_PUBLIC_* variables that are read with this exact `process.env.NAME` syntax.
const parsed = envSchema.safeParse({ EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL });

// Shown by the root layout instead of crashing when the bundle was built without a valid API URL.
export const envError = parsed.success
  ? null
  : `The app is not configured: ${parsed.error.issues.map((issue) => issue.message).join(", ")}.`;

export const env = Object.freeze({
  apiUrl: parsed.success ? parsed.data.EXPO_PUBLIC_API_URL.replace(/\/+$/, "") : "",
});
