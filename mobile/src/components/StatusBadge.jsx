import { Badge } from "./Badge";

// Project and task statuses from docs/DESIGN.md section 2.
const STATUSES = {
  NOT_STARTED: { label: "Not Started", tone: "neutral" },
  PENDING: { label: "Pending", tone: "neutral" },
  IN_PROGRESS: { label: "In Progress", tone: "primary" },
  COMPLETED: { label: "Completed", tone: "green" },
};

export function StatusBadge({ status }) {
  const config = STATUSES[status];
  if (!config) return null;
  return <Badge label={config.label} tone={config.tone} accessibilityLabel={`Status: ${config.label}`} />;
}
