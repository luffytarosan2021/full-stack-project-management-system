import { cn } from "@/lib/utils";

// Task priorities from docs/DESIGN.md section 2.
const PRIORITIES = {
  LOW: { label: "Low", className: "bg-badge-neutral-bg text-badge-neutral" },
  MEDIUM: { label: "Medium", className: "bg-badge-amber-bg text-badge-amber" },
  HIGH: { label: "High", className: "bg-badge-red-bg text-badge-red" },
};

export function PriorityBadge({ priority }) {
  const config = PRIORITIES[priority];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        config.className,
      )}
    >
      <span className="sr-only">Priority: </span>
      {config.label}
    </span>
  );
}
