import { useToast } from "@/components/toastContext.js";
import { useSaveTask } from "./taskQueries.js";

// Checkbox/button quick action: PUT { status: "COMPLETED" }, and back to PENDING when un-checked
// (docs/DESIGN.md section 6, applied to the web too).
export function useToggleTaskCompleted(task) {
  const showToast = useToast();
  const saveTask = useSaveTask(task, {
    onSuccess: () => showToast("Task saved."),
    onError: (error) => showToast(error.message, { tone: "error" }),
  });
  const completed = task.status === "COMPLETED";

  const toggle = () => saveTask.mutate({ status: completed ? "PENDING" : "COMPLETED" });

  return { completed, toggle, pending: saveTask.isPending };
}
