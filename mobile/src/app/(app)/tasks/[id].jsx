import { useLocalSearchParams, useRouter } from "expo-router";
import { FileX, FolderKanban, Trash2 } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { FormScrollView } from "@/components/FormScrollView";
import { isNotFound, NotFoundState } from "@/components/NotFoundState";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { useToast } from "@/components/toastContext.js";
import { TaskDueDate } from "@/features/tasks/TaskDueDate";
import { TaskForm } from "@/features/tasks/TaskForm";
import { useTask, useUpdateTask } from "@/features/tasks/taskQueries.js";
import { toUpdateBody } from "@/features/tasks/taskSchema.js";
import { useConfirmDeleteTask } from "@/features/tasks/useConfirmDeleteTask.js";
import { formatTimestamp } from "@/lib/dates.js";
import { MESSAGES } from "@/lib/messages.js";
import { colors, radius, spacing, TOUCH_TARGET } from "@/theme";

function TaskMeta({ task, onOpenProject }) {
  return (
    <View style={styles.meta}>
      <Pressable
        onPress={onOpenProject}
        accessibilityRole="link"
        accessibilityLabel={`Open project ${task.projectName}`}
        style={styles.projectLink}
      >
        <FolderKanban size={16} color={colors.primary} aria-hidden />
        <AppText variant="label" color={colors.primary} numberOfLines={1} style={styles.flex}>
          {task.projectName}
        </AppText>
      </Pressable>
      <TaskDueDate task={task} />
      <AppText variant="caption" muted>
        Created {formatTimestamp(task.createdAt)}
      </AppText>
    </View>
  );
}

function EditTask({ task }) {
  const router = useRouter();
  const showToast = useToast();
  const updateTask = useUpdateTask();
  const { confirmDelete, deleting } = useConfirmDeleteTask({ onDeleted: () => router.back() });

  // PUT only the fields that changed; if nothing really changed (e.g. only spaces), no request is sent.
  const save = async (values) => {
    const changes = toUpdateBody(task, values);
    if (Object.keys(changes).length > 0) {
      await updateTask.mutateAsync({ id: task.id, changes });
      showToast(MESSAGES.taskSaved);
    }
    router.back();
  };

  return (
    <FormScrollView>
      <TaskMeta task={task} onOpenProject={() => router.dismissTo(`/projects/${task.projectId}`)} />
      {/* Keyed by updatedAt so the form resets when the task changes on the server. */}
      <TaskForm
        key={task.updatedAt}
        task={task}
        onSave={save}
        saving={updateTask.isPending}
        footer={
          <Button variant="danger" icon={Trash2} onPress={() => confirmDelete(task)} pending={deleting} pendingLabel="Deleting…">
            Delete task
          </Button>
        }
      />
    </FormScrollView>
  );
}

function TaskContent({ id }) {
  const { data: task, error, isFetching, refetch } = useTask(id);

  // After a confirmed 404 (deleted here or on the web) cached data is never shown. Other errors
  // (e.g. a refetch while offline) keep the form, so unsaved edits are not lost.
  if (isNotFound(error)) {
    return (
      <NotFoundState
        icon={FileX}
        title="Task not found"
        message="This task may have been deleted, or the link is incorrect."
        backLabel="Back to projects"
        backHref="/projects"
      />
    );
  }
  if (task) return <EditTask task={task} />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} retrying={isFetching} />;
  return <LoadingState label="Loading task…" />;
}

export default function TaskScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.screen}>
      <OfflineBanner />
      <TaskContent key={id} id={id} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  meta: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  projectLink: { minHeight: TOUCH_TARGET - 12, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  flex: { flex: 1 },
});
