import { useLocalSearchParams, useRouter } from "expo-router";
import { FolderX } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { FormScrollView } from "@/components/FormScrollView";
import { isNotFound, NotFoundState } from "@/components/NotFoundState";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { useToast } from "@/components/toastContext.js";
import { useProject } from "@/features/projects/projectQueries.js";
import { TaskForm } from "@/features/tasks/TaskForm";
import { useCreateTask } from "@/features/tasks/taskQueries.js";
import { toCreateBody } from "@/features/tasks/taskSchema.js";
import { MESSAGES } from "@/lib/messages.js";
import { colors } from "@/theme";

// Create a task in the project it was opened from; the project cannot be changed here.
function NewTaskContent({ projectId }) {
  const router = useRouter();
  const showToast = useToast();
  const { data: project, error, isFetching, refetch } = useProject(projectId);
  const createTask = useCreateTask();

  if (isNotFound(error) || !projectId) {
    return (
      <NotFoundState
        icon={FolderX}
        title="Project not found"
        message="This project may have been deleted, or the link is incorrect."
        backLabel="Back to projects"
        backHref="/projects"
      />
    );
  }
  if (!project) {
    if (error) return <ErrorState message={error.message} onRetry={() => refetch()} retrying={isFetching} />;
    return <LoadingState label="Loading project…" />;
  }

  const save = async (values) => {
    await createTask.mutateAsync(toCreateBody(project.id, values));
    showToast(MESSAGES.taskSaved);
    router.back();
  };

  return (
    <FormScrollView>
      <TaskForm projectName={project.name} onSave={save} saving={createTask.isPending} />
    </FormScrollView>
  );
}

export default function NewTaskScreen() {
  const { projectId } = useLocalSearchParams();

  return (
    <View style={styles.screen}>
      <OfflineBanner />
      <NewTaskContent projectId={typeof projectId === "string" ? projectId : ""} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
});
