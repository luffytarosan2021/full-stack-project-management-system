import { cn } from "@/lib/utils";

const NEUTRAL = "bg-badge-neutral-bg text-badge-neutral";
const BLUE = "bg-badge-blue-bg text-badge-blue";
const GREEN = "bg-badge-green-bg text-badge-green";

// Dot colors that match each status
const DOT_COLORS = {
  NOT_STARTED: "#94a3b8",
  PENDING: "#94a3b8",
  IN_PROGRESS: "#2d6a4f",   // sage green to match new primary
  COMPLETED: "#15803d",
};

// Project and task statuses from docs/DESIGN.md section 2.
const STATUSES = {
  NOT_STARTED: { label: "Not Started", className: NEUTRAL },
  PENDING: { label: "Pending", className: NEUTRAL },
  IN_PROGRESS: {
    label: "In Progress",
    // Use green tones for in-progress to match the screenshot aesthetic
    className: "bg-[#e8f4ee] text-[#2d6a4f]",
  },
  COMPLETED: { label: "Completed", className: GREEN },
};

export function StatusBadge({ status }) {
  const config = STATUSES[status];
  if (!config) return null;
  const dotColor = DOT_COLORS[status] ?? "#94a3b8";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        config.className,
      )}
    >
      <span
        className="badge-dot"
        style={{ backgroundColor: dotColor }}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
