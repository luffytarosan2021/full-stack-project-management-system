import { ArrowLeft, CircleCheck, ListX, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { DeleteTaskDialog } from "@/features/tasks/DeleteTaskDialog";
import { TaskDueDate } from "@/features/tasks/TaskDueDate";
import { TaskFormDialog } from "@/features/tasks/TaskFormDialog";
import { taskPath } from "@/features/tasks/taskOptions.js";
import { useTask } from "@/features/tasks/taskQueries.js";
import { useToggleTaskCompleted } from "@/features/tasks/useToggleTaskCompleted.js";
import { formatTimestamp } from "@/lib/dates.js";

function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex w-fit max-w-full items-center gap-2 rounded-md text-sm text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{children}</span>
    </Link>
  );
}

function DetailItem({ label, children }) {
  return (
    <div className="grid min-w-0 gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

function TaskDetails({ task }) {
  const navigate = useNavigate();
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const { completed, toggle, pending } = useToggleTaskCompleted(task);
  const projectPath = `/projects/${task.projectId}`;

  return (
    <>
      <BackLink to={projectPath}>{task.projectName}</BackLink>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="min-w-0 text-2xl font-semibold wrap-anywhere">{task.name}</h1>
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
          <Button variant="outline" size="lg" className="col-span-2 px-4" onClick={toggle} disabled={pending} aria-busy={pending}>
            {completed ? <RotateCcw aria-hidden="true" /> : <CircleCheck aria-hidden="true" />}
            {completed ? "Mark as pending" : "Mark completed"}
          </Button>
          <Button variant="outline" size="lg" className="px-4" onClick={() => setEditOpen(true)}>
            <Pencil aria-hidden="true" />
            Edit
          </Button>
          <Button variant="destructive" size="lg" className="px-4" onClick={() => setDeleteOpen(true)}>
            <Trash2 aria-hidden="true" />
            Delete
          </Button>
        </div>
      </header>

      <div className="grid gap-6 rounded-xl border bg-card p-6">
        <section className="grid gap-2" aria-labelledby="task-description">
          <h2 id="task-description" className="text-sm text-muted-foreground">
            Description
          </h2>
          {task.description ? (
            <p className="text-sm whitespace-pre-line wrap-anywhere">{task.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No description.</p>
          )}
        </section>
        <dl className="grid gap-4 border-t pt-6 sm:grid-cols-3">
          <DetailItem label="Project">
            <Link to={projectPath} className="text-primary wrap-anywhere hover:text-primary-hover hover:underline">
              {task.projectName}
            </Link>
          </DetailItem>
          <DetailItem label="Due date">
            <TaskDueDate task={task} />
          </DetailItem>
          <DetailItem label="Created">{formatTimestamp(task.createdAt)}</DetailItem>
        </dl>
      </div>

      <TaskFormDialog
        open={isEditOpen}
        onOpenChange={setEditOpen}
        projectId={task.projectId}
        task={task}
        onSaved={() => setEditOpen(false)}
      />
      <DeleteTaskDialog
        task={task}
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate(projectPath, { replace: true })}
      />
    </>
  );
}

function TaskContent({ projectId, taskId }) {
  const { data: task, error, isFetching, refetch } = useTask(taskId);

  // Errors are checked before `task`: a failed refetch keeps an old cached copy, which may be of a deleted task.
  if (!error && task) {
    // The task decides its project: a URL with the wrong project id is corrected, not trusted.
    if (task.projectId !== projectId) return <Navigate to={taskPath(task)} replace />;
    return <TaskDetails task={task} />;
  }

  const backLink = <BackLink to={`/projects/${encodeURIComponent(projectId)}`}>Project</BackLink>;

  // 404: missing or owned by someone else (the API does not distinguish). 400: malformed id in the URL.
  if (error?.status === 404 || error?.status === 400) {
    return (
      <>
        {backLink}
        <EmptyState
          icon={ListX}
          title="Task not found"
          message="This task may have been deleted, or the link is incorrect."
          action={
            <Link to="/projects" className={buttonVariants({ variant: "outline", size: "lg", className: "px-4" })}>
              Back to projects
            </Link>
          }
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        {backLink}
        <ErrorState message={error.message} onRetry={() => refetch()} retrying={isFetching} />
      </>
    );
  }

  return <LoadingState label="Loading task…" />;
}

export function TaskDetailsPage() {
  const { projectId, taskId } = useParams();

  return (
    <section className="grid gap-6">
      <TaskContent key={taskId} projectId={projectId} taskId={taskId} />
    </section>
  );
}
