import { ListTodo, Plus, SearchX } from "lucide-react";
import { useCallback, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FilterSelect } from "@/components/FilterSelect";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { useFilterParams } from "@/lib/useFilterParams.js";
import { DeleteTaskDialog } from "./DeleteTaskDialog";
import { TaskFormDialog } from "./TaskFormDialog";
import { TaskItem, TaskItemSkeleton } from "./TaskItem";
import { TASK_PRIORITIES, TASK_PRIORITY_VALUES, TASK_STATUSES, TASK_STATUS_VALUES } from "./taskOptions.js";
import { useTasks } from "./taskQueries.js";

const TABLE = "divide-y rounded-xl border bg-card overflow-hidden";

function AddTaskButton({ onClick }) {
  return (
    <Button size="default" className="gap-2 px-4 shrink-0" onClick={onClick}>
      <Plus className="size-4" aria-hidden="true" />
      Add Task
    </Button>
  );
}

// Column header row visible on md+
function TableHeader() {
  return (
    <div
      className="hidden md:grid items-center gap-x-4 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40"
      style={{ gridTemplateColumns: "auto 1fr auto" }}
      aria-hidden="true"
    >
      <div className="size-4" />
      <span>Task Name</span>
      <div className="flex items-center gap-3 shrink-0">
        <span className="w-16">Priority</span>
        <span className="w-20">Status</span>
        <span className="w-28">Due Date</span>
        <span className="size-7" />
      </div>
    </div>
  );
}

function TaskList({ filters, hasFilters, onClearFilters, onCreate, onEdit, onDelete }) {
  const { data, error, isFetching, isPlaceholderData, refetch } = useTasks(filters);

  // A failed refetch keeps the old cached rows, which may include deleted or changed tasks, so the error wins.
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} retrying={isFetching} />;
  if (!data) {
    return (
      <div className={TABLE}>
        <TableHeader />
        <ul role="status" aria-label="Loading tasks">
          <TaskItemSkeleton />
          <TaskItemSkeleton />
          <TaskItemSkeleton />
        </ul>
      </div>
    );
  }

  if (data.items.length === 0) {
    return hasFilters ? (
      <EmptyState
        icon={SearchX}
        title="No tasks found"
        message="Try a different search or filter."
        action={
          <Button variant="outline" size="default" className="gap-1.5" onClick={onClearFilters}>
            Clear filters
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={ListTodo}
        title="No tasks yet"
        message="Add a task to this project."
        action={<AddTaskButton onClick={onCreate} />}
      />
    );
  }

  return (
    <div className={TABLE}>
      <TableHeader />
      <ul aria-label="Tasks" aria-busy={isPlaceholderData}>
        {data.items.map((task) => (
          <TaskItem key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  );
}

// Task toolbar and list on Project Details (docs/DESIGN.md section 5, route /projects/:id)
export function ProjectTasks({ projectId }) {
  const { search, getEnum, updateFilters } = useFilterParams();
  const status = getEnum("status", TASK_STATUS_VALUES);
  const priority = getEnum("priority", TASK_PRIORITY_VALUES);
  const hasFilters = Boolean(search || status || priority);

  // The selected task is kept while a dialog closes so its content does not change mid-animation.
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);

  const handleSearch = useCallback((value) => updateFilters({ search: value }), [updateFilters]);
  const clearFilters = () => updateFilters({ search: "", status: "", priority: "" });

  const openCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };
  const openEdit = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };
  const openDelete = (task) => {
    setDeletingTask(task);
    setDeleteOpen(true);
  };

  // After creating, clear filters so the new task is visible.
  const handleSaved = () => {
    setFormOpen(false);
    if (!editingTask && hasFilters) clearFilters();
  };

  return (
    <section aria-labelledby="tasks-heading" className="grid gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onSearch={handleSearch}
          label="Search tasks"
          placeholder="Search tasks…"
          className="flex-1 min-w-40"
        />
        <FilterSelect
          label="Filter by status"
          allLabel="Status: All"
          value={status}
          options={TASK_STATUSES}
          onChange={(value) => updateFilters({ status: value })}
          className="w-36"
        />
        <FilterSelect
          label="Filter by priority"
          allLabel="Priority: All"
          value={priority}
          options={TASK_PRIORITIES}
          onChange={(value) => updateFilters({ priority: value })}
          className="w-36"
        />
        <AddTaskButton onClick={openCreate} />
      </div>

      {/* Task list */}
      <TaskList
        filters={{ projectId, search, status, priority }}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <TaskFormDialog
        open={isFormOpen}
        onOpenChange={setFormOpen}
        projectId={projectId}
        task={editingTask}
        onSaved={handleSaved}
      />
      <DeleteTaskDialog
        task={deletingTask}
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => setDeleteOpen(false)}
      />
    </section>
  );
}
