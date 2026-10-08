import { CircleCheck, Clock, FolderClock, FolderKanban, ListChecks } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import { StatCard, StatCardSkeleton } from "@/components/StatCard";
import { useDashboardStats } from "@/features/dashboard/useDashboardStats.js";

// Order and labels from docs/DESIGN.md section 5 ("Dashboard cards").
const STATS = [
  { key: "totalProjects", label: "Total Projects", icon: FolderKanban, tone: "primary" },
  { key: "totalTasks", label: "Total Tasks", icon: ListChecks, tone: "primary" },
  { key: "completedTasks", label: "Completed Tasks", icon: CircleCheck, tone: "green" },
  { key: "pendingTasks", label: "Pending Tasks", icon: Clock, tone: "neutral" },
  { key: "projectsInProgress", label: "Projects In Progress", icon: FolderClock, tone: "blue" },
];

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5";

function DashboardStats() {
  const { data, error, isFetching, refetch } = useDashboardStats();

  if (data) {
    return (
      <dl className={GRID}>
        {STATS.map(({ key, ...stat }) => (
          <StatCard key={key} value={data[key]} {...stat} />
        ))}
      </dl>
    );
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} retrying={isFetching} />;
  }

  return (
    <div role="status" aria-label="Loading dashboard" className={GRID}>
      {STATS.map(({ key }) => (
        <StatCardSkeleton key={key} />
      ))}
    </div>
  );
}

export function DashboardPage() {
  return (
    <section className="grid gap-6">
      <header className="grid gap-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">An overview of your projects and tasks.</p>
      </header>
      <DashboardStats />
    </section>
  );
}
