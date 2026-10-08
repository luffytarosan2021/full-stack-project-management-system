import { useToast } from "@/components/toastContext.js";
import { MESSAGES } from "@/lib/messages.js";
import { useUpdateTask } from "./taskQueries.js";

// Checkbox quick action (docs/DESIGN.md section 6): PUT { status: "COMPLETED" }, and back to
// PENDING when un-checked. Only the status field is sent.
export function useToggleTaskCompleted() {
  const showToast = useToast();
  const updateTask = useUpdateTask({
    onSuccess: () => showToast(MESSAGES.taskSaved),
    onError: (error) => showToast(error.message, { tone: "error" }),
  });

  const toggle = (task) =>
    updateTask.mutate({ id: task.id, changes: { status: task.status === "COMPLETED" ? "PENDING" : "COMPLETED" } });

  return { toggle, pendingId: updateTask.isPending ? updateTask.variables?.id : null };
}
