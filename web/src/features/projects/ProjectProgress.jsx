// Progress = completedTaskCount / taskCount, both supplied by the API.
// `compact` = true: used in cards (smaller label, tighter layout).
export function ProjectProgress({ completed, total, compact = false }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const summary =
    total === 0
      ? "No tasks yet"
      : `${completed} of ${total} ${total === 1 ? "task" : "tasks"} completed`;

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-3">
        {compact ? (
          <span className="text-xs text-muted-foreground">
            Progress
            <span className="ml-1 font-medium text-foreground">{summary}</span>
          </span>
        ) : (
          <>
            <span className="text-sm text-muted-foreground">{summary}</span>
            <span className="text-sm font-medium tabular-nums">{percent}%</span>
          </>
        )}
      </div>
      <div
        role="progressbar"
        aria-label="Task progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={summary}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, backgroundColor: "var(--primary)" }}
        />
      </div>
    </div>
  );
}
