import { CircleCheck, Clock, FolderClock, FolderKanban, ListChecks } from "lucide-react";
import { Link } from "react-router";
import { ErrorState } from "@/components/ErrorState";
import { StatCard, StatCardSkeleton } from "@/components/StatCard";
import { useAuth } from "@/features/auth/authContext.js";
import { useDashboardStats } from "@/features/dashboard/useDashboardStats.js";
import { useTasks } from "@/features/tasks/taskQueries.js";
import { useProjects } from "@/features/projects/projectQueries.js";
import { TaskItem, TaskItemSkeleton } from "@/features/tasks/TaskItem";
import { ProjectCard, ProjectCardSkeleton } from "@/features/projects/ProjectCard";

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5";

function DashboardStats() {
  const { data, error, isFetching, refetch } = useDashboardStats();

  if (data) {
    const taskPercent = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;

    return (
      <dl className={GRID}>
        <StatCard label="Total Projects" value={data.totalProjects} icon={FolderKanban} tone="primary" />
        <StatCard label="Total Tasks" value={data.totalTasks} icon={ListChecks} tone="primary" detail={`${data.completedTasks} of ${data.totalTasks} resolved`} />
        <StatCard label="Completed" value={data.completedTasks} icon={CircleCheck} tone="green" detail={`${taskPercent}% of tasks`} />
        <StatCard label="Pending" value={data.pendingTasks} icon={Clock} tone="neutral" />
        <StatCard label="In Progress" value={data.projectsInProgress} icon={FolderClock} tone="blue" />
      </dl>
    );
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} retrying={isFetching} />;
  }

  return (
    <div role="status" aria-label="Loading dashboard" className={GRID}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

function PriorityTasks() {
  const { data, error, isFetching } = useTasks({}); // Fetch all tasks, we'll sort them

  if (error) return <div className="p-4 text-sm text-destructive border rounded-2xl">Failed to load tasks</div>;
  if (!data) return <ul className="divide-y border rounded-2xl overflow-hidden bg-card"><TaskItemSkeleton /><TaskItemSkeleton /></ul>;

  const upcoming = [...data.items]
    .filter(t => t.status !== "COMPLETED")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Priority Deliverables & Upcoming</h2>
      </div>
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        {upcoming.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No upcoming tasks.</div>
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map(task => (
              <TaskItem key={task.id} task={task} onEdit={() => {}} onDelete={() => {}} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ActiveProjects() {
  const { data, error, isFetching } = useProjects({});

  if (error) return <div className="p-4 text-sm text-destructive border rounded-2xl">Failed to load projects</div>;
  if (!data) return <div className="grid gap-4"><ProjectCardSkeleton /><ProjectCardSkeleton /></div>;

  const active = [...data.items]
    .filter(p => p.status !== "COMPLETED")
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">Active Workstreams</h2>
      <div className="grid gap-4">
        {active.length === 0 ? (
          <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm shadow-sm">
            No active projects.
          </div>
        ) : (
          active.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  );
}

function TasksByProjectChart() {
  const { data, error, isFetching } = useProjects({});

  if (error) return <div className="p-4 text-sm text-destructive border rounded-2xl">Failed to load projects</div>;
  if (!data) return <div className="h-[200px] bg-muted animate-pulse rounded-2xl" />;

  const projects = [...data.items]
    .sort((a, b) => b.taskCount - a.taskCount)
    .slice(0, 5); // top 5 projects by task count

  if (projects.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Tasks by Project</h2>
        <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm shadow-sm">
          No projects available for chart.
        </div>
      </div>
    );
  }

  const maxTasks = Math.max(...projects.map(p => p.taskCount), 1);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">Tasks by Project</h2>
      <div className="bg-card rounded-2xl border p-6 shadow-sm flex flex-col gap-5">
        {projects.map(project => (
          <div key={project.id} className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground truncate pr-4">{project.name}</span>
              <span className="font-semibold text-muted-foreground shrink-0">{project.taskCount} tasks</span>
            </div>
            <div className="h-2 w-full flex">
              <div
                className="h-full bg-muted rounded-full overflow-hidden flex min-w-[2px]"
                style={{ width: `${(project.taskCount / maxTasks) * 100}%` }}
              >
                {project.taskCount > 0 ? (
                  <>
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(project.completedTaskCount / project.taskCount) * 100}%` }}
                      title={`${project.completedTaskCount} completed`}
                    />
                    <div
                      className="h-full bg-primary/30"
                      style={{ width: `${((project.taskCount - project.completedTaskCount) / project.taskCount) * 100}%` }}
                      title={`${project.taskCount - project.completedTaskCount} pending`}
                    />
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();

  const now = new Date();
  const today = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const hour = now.getHours();

  let greeting = "Good evening";
  if (hour >= 5 && hour < 12) {
    greeting = "Good morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  }

  return (
    <section className="grid gap-8 pb-8">
      {/* Header matching screenshot layout */}
      <header className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="text-primary font-bold">TODAY</span> • {today}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">
          {greeting}, {user?.fullName ? user.fullName.split(" ")[0] : "there"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Here is your operational snapshot across engineering, product design, and key milestones.
        </p>
      </header>

      {/* KPI Cards */}
      <DashboardStats />

      {/* 2-column layout */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <TasksByProjectChart />
          <PriorityTasks />
        </div>
        <div className="lg:col-span-1">
          <ActiveProjects />
        </div>
      </div>
    </section>
  );
}
