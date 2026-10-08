const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Real calendar dates only: JavaScript would silently roll 2026-02-30 over to March 2.
export function isRealDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const isDateFormat = (value) => DATE_PATTERN.test(value);

// The user's own calendar date as "YYYY-MM-DD", so it can be compared with API date strings directly.
export function todayDate(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// "07 Oct 2026" (docs/DESIGN.md section 3).
function format(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric", timeZone })
    .formatToParts(date)
    .reduce((acc, { type, value }) => ({ ...acc, [type]: value }), {});
  return `${parts.day} ${parts.month} ${parts.year}`;
}

// API date-only values are formatted in UTC so they can never shift by a day.
export const formatDate = (value) => format(new Date(`${value}T00:00:00Z`), "UTC");

// Timestamps (createdAt) are real instants, so they are shown in the user's own time zone.
export const formatTimestamp = (value) => format(new Date(value), undefined);
