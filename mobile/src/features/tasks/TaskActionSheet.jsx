import { Flag, ListChecks, Pencil, Trash2 } from "lucide-react-native";
import { ActionSheet } from "@/components/ActionSheet";
import { useToast } from "@/components/toastContext.js";
import { MESSAGES } from "@/lib/messages.js";
import { TASK_PRIORITIES, TASK_STATUSES } from "./taskOptions.js";
import { useUpdateTask } from "./taskQueries.js";

const OPTIONS = { status: TASK_STATUSES, priority: TASK_PRIORITIES };
const TITLES = { status: "Change status", priority: "Change priority" };

// Long-press / "more" menu for a task row: Edit, Change status, Change priority, Delete (docs/DESIGN.md section 6).
// `menu` is null or { task, view: "main" | "status" | "priority" }.
export function TaskActionSheet({ menu, onChangeMenu, onEdit, onDelete }) {
  const showToast = useToast();
  const updateTask = useUpdateTask({
    onSuccess: () => showToast(MESSAGES.taskSaved),
    onError: (error) => showToast(error.message, { tone: "error" }),
  });

  const close = () => onChangeMenu(null);
  const task = menu?.task;

  const mainActions = task
    ? [
        { label: "Edit", icon: Pencil, onPress: () => onEdit(task) },
        { label: "Change status", icon: ListChecks, onPress: () => onChangeMenu({ task, view: "status" }) },
        { label: "Change priority", icon: Flag, onPress: () => onChangeMenu({ task, view: "priority" }) },
        { label: "Delete", icon: Trash2, destructive: true, onPress: () => onDelete(task) },
      ]
    : [];

  // The current value is disabled, so choosing it never sends a request that changes nothing.
  const choiceActions = (field) =>
    OPTIONS[field].map(({ value, label }) => ({
      label: value === task[field] ? `${label} (current)` : label,
      disabled: value === task[field],
      onPress: () => updateTask.mutate({ id: task.id, changes: { [field]: value } }),
    }));

  const view = menu?.view ?? "main";

  return (
    <ActionSheet
      visible={Boolean(menu)}
      title={view === "main" ? task?.name : `${TITLES[view]}: ${task?.name}`}
      actions={view === "main" ? mainActions : choiceActions(view)}
      onClose={close}
    />
  );
}
