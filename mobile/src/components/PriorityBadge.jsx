import { Badge } from "./Badge";

// Task priorities from docs/DESIGN.md section 2.
const PRIORITIES = {
  LOW: { label: "Low", tone: "neutral" },
  MEDIUM: { label: "Medium", tone: "amber" },
  HIGH: { label: "High", tone: "red" },
};

export function PriorityBadge({ priority }) {
  const config = PRIORITIES[priority];
  if (!config) return null;
  return <Badge label={config.label} tone={config.tone} accessibilityLabel={`Priority: ${config.label}`} />;
}
