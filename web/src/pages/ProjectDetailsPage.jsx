import { ArrowLeft, FolderX, Pencil, Trash2 } from "lucide-react";
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

function DetailItem({ label, children }) {
  return (
    <div className="grid gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

function ProjectDetails({ project }) {
  const navigate = useNavigate();
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const { name, description, status, startDate, endDate, createdAt, taskCount, completedTaskCount } = project;

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="min-w-0 text-2xl font-semibold wrap-anywhere">{name}</h1>
          <StatusBadge status={status} />
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="lg" className="flex-1 px-4 sm:flex-none" onClick={() => setEditOpen(true)}>
            <Pencil aria-hidden="true" />
            Edit
          </Button>
          <Button variant="destructive" size="lg" className="flex-1 px-4 sm:flex-none" onClick={() => setDeleteOpen(true)}>
            <Trash2 aria-hidden="true" />
            Delete
          </Button>
        </div>
      </header>

      <div className="grid gap-6 rounded-xl border bg-card p-6">
        <section className="grid gap-2" aria-labelledby="project-description">
          <h2 id="project-description" className="text-sm text-muted-foreground">
            Description
          </h2>
          {description ? (
            <p className="text-sm whitespace-pre-line wrap-anywhere">{description}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No description.</p>
          )}
        </section>
        <dl className="grid gap-4 border-t pt-6 sm:grid-cols-3">
          <DetailItem label="Start date">{formatDate(startDate)}</DetailItem>
          <DetailItem label="End date">{formatDate(endDate)}</DetailItem>
          <DetailItem label="Created">{formatTimestamp(createdAt)}</DetailItem>
        </dl>
        <section className="grid gap-2 border-t pt-6" aria-labelledby="project-progress">
          <h2 id="project-progress" className="text-sm text-muted-foreground">
            Progress
          </h2>
          <ProjectProgress completed={completedTaskCount} total={taskCount} />
        </section>
      </div>

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
          <Link to="/projects" className={buttonVariants({ variant: "outline", size: "lg", className: "px-4" })}>
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
        className="inline-flex w-fit items-center gap-2 rounded-md text-sm text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Projects
      </Link>
      <ProjectContent key={id} id={id} />
    </section>
  );
}
