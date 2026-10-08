// Progress = completedTaskCount / taskCount, both supplied by the API.
export function ProjectProgress({ completed, total }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const summary = total === 0 ? "No tasks yet" : `${completed} of ${total} ${total === 1 ? "task" : "tasks"} completed`;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{summary}</span>
        <span className="font-medium tabular-nums">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label="Task progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={summary}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
