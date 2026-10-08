import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/toastContext.js";
import { useDeleteProject } from "./projectQueries.js";

// Confirmation text from docs/DESIGN.md section 7. The API deletes the project's tasks with it.
export function DeleteProjectDialog({ project, open, onOpenChange, onDeleted }) {
  const showToast = useToast();
  const deleteProject = useDeleteProject();

  const handleOpenChange = (next) => {
    if (!next) deleteProject.reset();
    onOpenChange(next);
  };

  const confirm = () =>
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        showToast("Project deleted.");
        onDeleted();
      },
    });

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Delete this project?"
      description="This will also delete all of its tasks. This cannot be undone."
      onConfirm={confirm}
      pending={deleteProject.isPending}
      error={deleteProject.error?.message}
    />
  );
}
