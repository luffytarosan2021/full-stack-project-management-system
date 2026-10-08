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
    <Button size="lg" className="px-4" onClick={onClick}>
      <Plus aria-hidden="true" />
      New Project
    </Button>
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
          <Button variant="outline" size="lg" className="px-4" onClick={onClearFilters}>
            Clear filters
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        message="Create your first project to get started."
        action={<NewProjectButton onClick={onCreate} />}
      />
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
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">Plan your work and track progress across projects.</p>
        </div>
        <NewProjectButton onClick={() => setCreateOpen(true)} />
      </header>

      <div role="search" className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onSearch={handleSearch} label="Search projects" placeholder="Search projects" />
        <FilterSelect
          label="Filter by status"
          value={status}
          options={PROJECT_STATUSES}
          onChange={(value) => updateFilters({ status: value })}
        />
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
