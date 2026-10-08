import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTimestamp } from "@/lib/dates.js";
import { cn } from "@/lib/utils";
import { TaskDueDate } from "./TaskDueDate";
import { taskPath } from "./taskOptions.js";
import { useToggleTaskCompleted } from "./useToggleTaskCompleted.js";

function TaskActions({ task, onEdit, onDelete }) {
  // Non-modal so the menu closes cleanly when it opens a dialog.
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="-my-1 shrink-0" aria-label={`Actions for ${task.name}`}>
          <Ellipsis aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onSelect={() => onEdit(task)}>
          <Pencil aria-hidden="true" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(task)}>
          <Trash2 aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// docs/DESIGN.md TaskItem: checkbox (mark complete), name, priority, status, due date, overflow actions.
export function TaskItem({ task, onEdit, onDelete }) {
  const { completed, toggle, pending } = useToggleTaskCompleted(task);

  return (
    <li className="flex items-start gap-3 px-4 py-4 sm:px-5">
      <label className="-m-2 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-muted has-disabled:cursor-wait">
        <input
          type="checkbox"
          checked={completed}
          onChange={toggle}
          disabled={pending}
          aria-label={completed ? `Mark ${task.name} as pending` : `Mark ${task.name} as completed`}
          className="size-4 cursor-pointer accent-primary disabled:cursor-wait"
        />
      </label>
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-sm font-medium" title={task.name}>
            <Link
              to={taskPath(task)}
              className={cn(
                "rounded-sm hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                completed && "text-muted-foreground line-through",
              )}
            >
              {task.name}
            </Link>
          </h3>
          <TaskActions task={task} onEdit={onEdit} onDelete={onDelete} />
        </div>
        {task.description ? (
          <p className="line-clamp-1 text-sm wrap-anywhere text-muted-foreground">{task.description}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          <TaskDueDate task={task} prefix="Due " />
          <span className="text-xs text-muted-foreground">Created {formatTimestamp(task.createdAt)}</span>
        </div>
      </div>
    </li>
  );
}

export function TaskItemSkeleton() {
  return (
    <li className="flex items-start gap-3 px-4 py-4 sm:px-5" aria-hidden="true">
      <div className="size-5 animate-pulse rounded bg-muted" />
      <div className="grid flex-1 gap-2">
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </li>
  );
}
