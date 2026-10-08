import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/dates.js";
import { cn } from "@/lib/utils";
import { TaskDueDate } from "./TaskDueDate";
import { useToggleTaskCompleted } from "./useToggleTaskCompleted.js";

function TaskActions({ task, onEdit, onDelete }) {
  // Non-modal so the menu closes cleanly when it opens a dialog.
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="shrink-0" aria-label={`Actions for ${task.name}`}>
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

/**
 * Task row — matches the Stitch screenshot table layout.
 * Columns: checkbox | name+desc | priority | status | due date | actions
 * On narrow screens columns collapse gracefully.
 */
export function TaskItem({ task, onEdit, onDelete }) {
  const { completed, toggle, pending } = useToggleTaskCompleted(task);

  return (
    <li className={cn("task-row grid items-center gap-x-4 px-4 py-3.5 sm:px-5", "grid-cols-[auto_1fr_auto]")}>
      {/* Checkbox */}
      <label className="-m-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-muted has-disabled:cursor-wait">
        <input
          type="checkbox"
          checked={completed}
          onChange={toggle}
          disabled={pending}
          aria-label={completed ? `Mark ${task.name} as pending` : `Mark ${task.name} as completed`}
          className="size-4 cursor-pointer rounded accent-primary disabled:cursor-wait"
        />
      </label>

      {/* Name + description */}
      <div className="min-w-0">
        <p
          className={cn(
            "truncate text-sm font-medium",
            completed && "text-muted-foreground line-through",
          )}
          title={task.name}
        >
          {task.name}
        </p>
        {task.description ? (
          <p className="truncate text-xs text-muted-foreground mt-0.5">{task.description}</p>
        ) : null}
      </div>

      {/* Right-side meta (visible md+) + actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Priority badge — hidden on mobile */}
        <div className="hidden md:block">
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Status badge — hidden on mobile */}
        <div className="hidden md:block">
          <StatusBadge status={task.status} />
        </div>

        {/* Due date — hidden on small screens */}
        <div className="hidden sm:block w-28">
          <TaskDueDate task={task} />
        </div>

        {/* Actions menu */}
        <TaskActions task={task} onEdit={onEdit} onDelete={onDelete} />
      </div>

      {/* Mobile-only: badges + due date on second line */}
      <div className="col-start-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 pt-1.5 sm:hidden">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
        <TaskDueDate task={task} />
      </div>
    </li>
  );
}

export function TaskItemSkeleton() {
  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 px-4 py-3.5 sm:px-5" aria-hidden="true">
      <div className="size-4 animate-pulse rounded bg-muted" />
      <div className="grid gap-1.5">
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:block h-5 w-16 animate-pulse rounded-full bg-muted" />
        <div className="hidden md:block h-5 w-20 animate-pulse rounded-full bg-muted" />
        <div className="hidden sm:block h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="size-7 animate-pulse rounded bg-muted" />
      </div>
    </li>
  );
}
