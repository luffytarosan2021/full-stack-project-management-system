import { ArrowLeft, CalendarDays, FolderX, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { DeleteProjectDialog } from "@/features/projects/DeleteProjectDialog";
import { ProjectFormDialog } from "@/features/projects/ProjectFormDialog";
import { ProjectProgress } from "@/features/projects/ProjectProgress";
import { useProject } from "@/features/projects/projectQueries.js";
import { ProjectTasks } from "@/features/tasks/ProjectTasks";
import { formatDate, formatTimestamp } from "@/lib/dates.js";

// Compute days remaining from today to endDate (YYYY-MM-DD)
function daysRemaining(endDate) {
  if (!endDate) return null;
  const [y, m, d] = endDate.split("-").map(Number);
  const end = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function ProjectDetails({ project }) {
  const navigate = useNavigate();
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const { name, description, status, startDate, endDate, createdAt, taskCount, completedTaskCount } = project;

  const days = daysRemaining(endDate);
  const activeTasks = taskCount - completedTaskCount;

  return (
    <>
      {/* Project header */}
      <header className="flex flex-col gap-4">
        {/* Title row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h1 className="min-w-0 text-2xl font-semibold tracking-tight wrap-anywhere">{name}</h1>
            <StatusBadge status={status} />
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              Created {formatTimestamp(createdAt)}
            </span>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 px-3"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 px-3 text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>

        {/* Description */}
        {description ? (
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line wrap-anywhere max-w-3xl">
            {description}
          </p>
        ) : null}

        {/* Date range */}
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          <span>
            <span className="whitespace-nowrap">{formatDate(startDate)}</span>
            {" – "}
            <span className="whitespace-nowrap">{formatDate(endDate)}</span>
          </span>
        </p>
      </header>

      {/* Progress + stats card */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
          {/* Progress */}
          <div className="grid gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Progress</p>
            <ProjectProgress completed={completedTaskCount} total={taskCount} />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-border self-stretch" aria-hidden="true" />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 sm:grid-cols-2 place-items-center">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Active Tasks</p>
              <p className="text-2xl font-semibold tabular-nums">{activeTasks}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Days Remaining</p>
              <p
                className="text-2xl font-semibold tabular-nums"
                style={{ color: days !== null && days < 0 ? "var(--destructive)" : undefined }}
              >
                {days === null ? "—" : days < 0 ? "0" : days}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks section */}
      <ProjectTasks projectId={project.id} />

      <ProjectFormDialog open={isEditOpen} onOpenChange={setEditOpen} project={project} onSaved={() => setEditOpen(false)} />
      <DeleteProjectDialog
        project={project}
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate("/projects", { replace: true })}
      />
    </>
  );
}

function ProjectContent({ id }) {
  const { data: project, error, isFetching, refetch } = useProject(id);

  if (project) return <ProjectDetails project={project} />;

  // 404: missing or owned by someone else (the API does not distinguish). 400: malformed id in the URL.
  if (error?.status === 404 || error?.status === 400) {
    return (
      <EmptyState
        icon={FolderX}
        title="Project not found"
        message="This project may have been deleted, or the link is incorrect."
        action={
          <Link to="/projects" className={buttonVariants({ variant: "outline", size: "default", className: "gap-1.5" })}>
            Back to projects
          </Link>
        }
      />
    );
  }

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} retrying={isFetching} />;
  return <LoadingState label="Loading project…" />;
}

export function ProjectDetailsPage() {
  const { id } = useParams();

  return (
    <section className="grid gap-6">
      <Link
        to="/projects"
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Projects
      </Link>
      <ProjectContent key={id} id={id} />
    </section>
  );
}
