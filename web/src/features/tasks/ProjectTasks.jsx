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

const LIST = "divide-y rounded-xl border bg-card";
const FILTER = "w-full md:w-44";

function AddTaskButton({ onClick }) {
  return (
    <Button size="lg" className="px-4" onClick={onClick}>
      <Plus aria-hidden="true" />
      Add Task
    </Button>
  );
}

function TaskList({ filters, hasFilters, onClearFilters, onCreate, onEdit, onDelete }) {
  const { data, error, isFetching, isPlaceholderData, refetch } = useTasks(filters);

  // A failed refetch keeps the old cached rows, which may include deleted or changed tasks, so the error wins.
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} retrying={isFetching} />;
  if (!data) {
    return (
      <ul role="status" aria-label="Loading tasks" className={LIST}>
        <TaskItemSkeleton />
        <TaskItemSkeleton />
        <TaskItemSkeleton />
      </ul>
    );
  }

  if (data.items.length === 0) {
    return hasFilters ? (
      <EmptyState
        icon={SearchX}
        title="No tasks found"
        message="Try a different search or filter."
        action={
          <Button variant="outline" size="lg" className="px-4" onClick={onClearFilters}>
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
    <ul className={LIST} aria-label="Tasks" aria-busy={isPlaceholderData}>
      {data.items.map((task) => (
        <TaskItem key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}

// Task toolbar and list on Project Details (docs/DESIGN.md section 5, route /projects/:id).
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="tasks-heading" className="text-lg font-semibold">
          Tasks
        </h2>
        <AddTaskButton onClick={openCreate} />
      </div>

      <div role="search" className="flex flex-col gap-3 md:flex-row">
        <SearchInput value={search} onSearch={handleSearch} label="Search tasks" placeholder="Search tasks" />
        <div className="grid grid-cols-2 gap-3 md:flex md:shrink-0">
          <FilterSelect
            label="Filter by status"
            allLabel="All statuses"
            value={status}
            options={TASK_STATUSES}
            onChange={(value) => updateFilters({ status: value })}
            className={FILTER}
          />
          <FilterSelect
            label="Filter by priority"
            allLabel="All priorities"
            value={priority}
            options={TASK_PRIORITIES}
            onChange={(value) => updateFilters({ priority: value })}
            className={FILTER}
          />
        </div>
      </div>

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
