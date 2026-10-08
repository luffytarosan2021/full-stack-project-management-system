import { CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/dates.js";
import { cn } from "@/lib/utils";
import { isOverdue } from "./taskOptions.js";

// Overdue due dates use the danger color plus the word "Overdue" (docs/DESIGN.md section 3).
export function TaskDueDate({ task, prefix = "" }) {
  const overdue = isOverdue(task);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm whitespace-nowrap",
        overdue ? "font-medium text-destructive" : "text-muted-foreground",
      )}
    >
      <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
      {prefix}
      {formatDate(task.dueDate)}
      {overdue ? <span>· Overdue</span> : null}
    </span>
  );
}
