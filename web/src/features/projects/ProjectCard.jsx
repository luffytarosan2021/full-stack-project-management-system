import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Link } from "react-router";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/dates.js";
import { ProjectProgress } from "./ProjectProgress";

const CARD =
  "relative flex h-full flex-col gap-3 rounded-xl border bg-card p-5 transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-primary/30";

// The whole card is clickable through the title link's stretched ::after.
export function ProjectCard({ project }) {
  const { id, name, description, status, startDate, endDate, taskCount, completedTaskCount } = project;

  return (
    <article className={CARD}>
      {/* Top row: status badge + arrow */}
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={status} />
        <Link
          to={`/projects/${id}`}
          aria-label={`Open ${name}`}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 after:absolute after:inset-0 after:rounded-xl"
          tabIndex={-1}
          aria-hidden="true"
        >
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Name — visible link for screen readers */}
      <div>
        <h2 className="text-base font-semibold leading-snug" title={name}>
          <Link
            to={`/projects/${id}`}
            className="outline-none hover:underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm"
          >
            {name}
          </Link>
        </h2>
        {description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground wrap-anywhere">{description}</p>
        ) : null}
      </div>

      {/* Date range */}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
        <span>
          <span className="sr-only">Dates: </span>
          <span className="whitespace-nowrap">{formatDate(startDate)}</span>
          {" – "}
          <span className="whitespace-nowrap">{formatDate(endDate)}</span>
        </span>
      </p>

      {/* Progress */}
      <div className="mt-auto">
        <ProjectProgress completed={completedTaskCount} total={taskCount} compact />
      </div>
    </article>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className={CARD} aria-hidden="true">
      <div className="flex items-center justify-between gap-2">
        <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-5 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid gap-1.5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-auto h-2 w-full animate-pulse rounded-full bg-muted" />
    </div>
  );
}
