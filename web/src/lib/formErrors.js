import { MESSAGES } from "./messages.js";

// Puts server `details.fields` errors under the matching inputs and returns a banner message for
// anything that cannot be shown on a field (or null when every error landed on a field).
export function applyServerErrors(error, setError, fieldNames) {
  const fields = error?.fields ?? [];
  const unmatched = fields.filter(({ field }) => !fieldNames.includes(field));

  fields
    .filter(({ field }) => fieldNames.includes(field))
    .forEach(({ field, message }, index) => setError(field, { type: "server", message }, { shouldFocus: index === 0 }));

  if (fields.length > 0 && unmatched.length === 0) return null;
  return unmatched[0]?.message ?? error?.message ?? MESSAGES.generic;
}
