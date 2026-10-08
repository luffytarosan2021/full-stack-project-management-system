import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/toastContext.js";
import { useDeleteTask } from "./taskQueries.js";

// Confirmation text from docs/DESIGN.md section 7.
export function DeleteTaskDialog({ task, open, onOpenChange, onDeleted }) {
  const showToast = useToast();
  const deleteTask = useDeleteTask();

  const handleOpenChange = (next) => {
    if (!next) deleteTask.reset();
    onOpenChange(next);
  };

  const confirm = () =>
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        showToast("Task deleted.");
        onDeleted();
      },
    });

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Delete this task?"
      description="This cannot be undone."
      onConfirm={confirm}
      pending={deleteTask.isPending}
      error={deleteTask.error?.message}
    />
  );
}
