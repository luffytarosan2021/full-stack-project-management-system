import { Alert } from "react-native";
import { useToast } from "@/components/toastContext.js";
import { MESSAGES } from "@/lib/messages.js";
import { useDeleteTask } from "./taskQueries.js";

// Native confirm dialog with the exact wording from docs/DESIGN.md section 7, then DELETE.
export function useConfirmDeleteTask({ onDeleted } = {}) {
  const showToast = useToast();
  const deleteTask = useDeleteTask({
    onSuccess: () => {
      showToast(MESSAGES.taskDeleted);
      onDeleted?.();
    },
    onError: (error) => showToast(error.message, { tone: "error" }),
  });

  const confirmDelete = (task) =>
    Alert.alert("Delete this task?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTask.mutate(task.id) },
    ]);

  return { confirmDelete, deleting: deleteTask.isPending };
}
