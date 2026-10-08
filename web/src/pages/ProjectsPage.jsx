import { FolderKanban, Plus, SearchX } from "lucide-react";
import { useCallback, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FilterSelect } from "@/components/FilterSelect";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { ProjectCard, ProjectCardSkeleton } from "@/features/projects/ProjectCard";
import { ProjectFormDialog } from "@/features/projects/ProjectFormDialog";
import { useProjects } from "@/features/projects/projectQueries.js";
import { PROJECT_STATUSES, PROJECT_STATUS_VALUES } from "@/features/projects/projectStatus.js";
import { useFilterParams } from "@/lib/useFilterParams.js";

// docs/DESIGN.md section 9: two columns up to 1024px inclusive, three above it.
const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 min-[1025px]:grid-cols-3";
const SKELETON_COUNT = 6;

function NewProjectButton({ onClick }) {
  return (
    <Button size="default" className="gap-2 px-4" onClick={onClick}>
      <Plus className="size-4" aria-hidden="true" />
      New Project
    </Button>
  );
}

function BirdMascot() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="size-32 text-muted-foreground/40"
    >
      <circle cx="100" cy="100" r="80" fill="#f1f0eb" />
      <circle cx="120" cy="120" r="30" fill="#fdf2ee" />
      <circle cx="75" cy="80" r="25" fill="#e8f4ee" />
      <path d="M50 115 Q100 95 150 120" stroke="#1c2b22" strokeWidth="4" strokeLinecap="round" />
      <path d="M120 120 Q130 100 110 90 Q90 80 80 100 Q70 120 120 120Z" fill="#2d6a4f" />
      <circle cx="115" cy="95" r="4" fill="white" />
      <circle cx="116" cy="95" r="2" fill="#1c2b22" />
      <path d="M130 95 L140 92 L132 100 Z" fill="#f4a261" />
      <ellipse cx="95" cy="110" rx="12" ry="8" fill="#e76f51" transform="rotate(-15 95 110)" />
      <circle cx="140" cy="115" r="3" fill="#e76f51" />
      <circle cx="65" cy="105" r="4" fill="#f4a261" />
      <circle cx="130" cy="135" r="3" fill="#2d6a4f" />
    </svg>
  );
}

function ProjectList({ filters, hasFilters, onClearFilters, onCreate }) {
  const { data, error, isFetching, isPlaceholderData, refetch } = useProjects(filters);

  if (!data) {
    if (error) return <ErrorState message={error.message} onRetry={() => refetch()} retrying={isFetching} />;
    return (
      <div role="status" aria-label="Loading projects" className={GRID}>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (data.items.length === 0) {
    return hasFilters ? (
      <EmptyState
        icon={SearchX}
        title="No projects found"
        message="Try a different search or filter."
        action={
          <Button variant="outline" size="default" className="gap-1.5" onClick={onClearFilters}>
            Clear filters
          </Button>
        }
      />
    ) : (
      <div className="flex flex-col items-center justify-center gap-6 rounded-xl border bg-card px-6 py-20 text-center">
        <BirdMascot />
        <div className="grid gap-1.5">
          <h2 className="text-lg font-semibold">No projects yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
            Get started by creating your very first project to track tasks and milestones.
          </p>
        </div>
        <Button size="default" className="gap-2 px-6 mt-2" onClick={onCreate}>
          <Plus className="size-4" aria-hidden="true" />
          Create Project
        </Button>
      </div>
    );
  }

  return (
    <ul className={GRID} aria-label="Projects" aria-busy={isPlaceholderData}>
      {data.items.map((project) => (
        <li key={project.id} className="min-w-0">
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}

export function ProjectsPage() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const { search, getEnum, updateFilters } = useFilterParams();
  const status = getEnum("status", PROJECT_STATUS_VALUES);
  const hasFilters = Boolean(search || status);

  const handleSearch = useCallback((value) => updateFilters({ search: value }), [updateFilters]);
  const clearFilters = () => updateFilters({ search: "", status: "" });

  // Clear filters after creating so the new project is visible at the top of the list.
  const handleCreated = () => {
    setCreateOpen(false);
    if (hasFilters) clearFilters();
  };

  return (
    <section className="grid gap-6">
      {/* Page header — breadcrumb + title + action */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-0.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Workspace / Portfolio
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        </div>

        {/* Search + filter + button — visible inline on md+ */}
        <div className="hidden md:flex items-center gap-3">
          <SearchInput
            value={search}
            onSearch={handleSearch}
            label="Filter projects"
            placeholder="Filter projects…"
            className="w-48"
          />
          <FilterSelect
            label="Filter by status"
            value={status}
            options={PROJECT_STATUSES}
            onChange={(value) => updateFilters({ status: value })}
            allLabel="All Statuses"
            className="w-48"
          />
          <NewProjectButton onClick={() => setCreateOpen(true)} />
        </div>
      </header>

      {/* Search + filter row for smaller screens */}
      <div role="search" className="flex flex-col gap-3 sm:flex-row md:hidden">
        <SearchInput value={search} onSearch={handleSearch} label="Search projects" placeholder="Search projects" />
        <FilterSelect
          label="Filter by status"
          value={status}
          options={PROJECT_STATUSES}
          onChange={(value) => updateFilters({ status: value })}
          allLabel="All Statuses"
        />
      </div>
      {/* New project button on small screens */}
      <div className="md:hidden">
        <NewProjectButton onClick={() => setCreateOpen(true)} />
      </div>

      <ProjectList
        filters={{ search, status }}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
        onCreate={() => setCreateOpen(true)}
      />

      <ProjectFormDialog open={isCreateOpen} onOpenChange={setCreateOpen} onSaved={handleCreated} />
    </section>
  );
}
