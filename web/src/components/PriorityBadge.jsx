import { cn } from "@/lib/utils";

// Task priorities from docs/DESIGN.md section 2.
const PRIORITIES = {
  LOW: { label: "Low", className: "bg-badge-neutral-bg text-badge-neutral", dot: "#94a3b8" },
  MEDIUM: { label: "Medium", className: "bg-badge-amber-bg text-badge-amber", dot: "#b45309" },
  HIGH: { label: "High", className: "bg-badge-red-bg text-badge-red", dot: "#b91c1c" },
};

export function PriorityBadge({ priority }) {
  const config = PRIORITIES[priority];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        config.className,
      )}
    >
      <span
        className="badge-dot"
        style={{ backgroundColor: config.dot }}
        aria-hidden="true"
      />
      <span className="sr-only">Priority: </span>
      {config.label}
    </span>
  );
}
