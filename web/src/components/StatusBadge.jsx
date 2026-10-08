import { cn } from "@/lib/utils";

const NEUTRAL = "bg-badge-neutral-bg text-badge-neutral";
const BLUE = "bg-badge-blue-bg text-badge-blue";
const GREEN = "bg-badge-green-bg text-badge-green";

// Project and task statuses from docs/DESIGN.md section 2.
const STATUSES = {
  NOT_STARTED: { label: "Not Started", className: NEUTRAL },
  PENDING: { label: "Pending", className: NEUTRAL },
  IN_PROGRESS: { label: "In Progress", className: BLUE },
  COMPLETED: { label: "Completed", className: GREEN },
};

export function StatusBadge({ status }) {
  const config = STATUSES[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
