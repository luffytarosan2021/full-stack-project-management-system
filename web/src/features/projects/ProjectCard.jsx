import { CalendarDays } from "lucide-react";
import { Link } from "react-router";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatTimestamp } from "@/lib/dates.js";
import { ProjectProgress } from "./ProjectProgress";

const CARD = "relative flex h-full flex-col gap-4 rounded-xl border bg-card p-5";

// The whole card is clickable through the title link's stretched ::after.
export function ProjectCard({ project }) {
  const { id, name, description, status, startDate, endDate, taskCount, completedTaskCount, createdAt } = project;

  return (
    <article className={`${CARD} transition-colors focus-within:ring-3 focus-within:ring-ring/50 hover:border-primary/40`}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 truncate text-base font-semibold" title={name}>
          <Link to={`/projects/${id}`} className="outline-none after:absolute after:inset-0 after:rounded-xl">
            {name}
          </Link>
        </h2>
        <StatusBadge status={status} />
      </div>
      {description ? <p className="line-clamp-2 text-sm wrap-anywhere text-muted-foreground">{description}</p> : null}
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
        <span>
          <span className="sr-only">Dates: </span>
          <span className="whitespace-nowrap">{formatDate(startDate)}</span> –{" "}
          <span className="whitespace-nowrap">{formatDate(endDate)}</span>
        </span>
      </p>
      <ProjectProgress completed={completedTaskCount} total={taskCount} />
      <p className="mt-auto text-xs text-muted-foreground">Created {formatTimestamp(createdAt)}</p>
    </article>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className={CARD} aria-hidden="true">
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
      <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
    </div>
  );
}
