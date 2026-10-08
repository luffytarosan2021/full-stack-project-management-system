import { useLocalSearchParams, useRouter } from "expo-router";
import { FolderX, ListTodo, Plus, SearchX } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { isNotFound, NotFoundState } from "@/components/NotFoundState";
import { OfflineBanner } from "@/components/OfflineBanner";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { useProject } from "@/features/projects/projectQueries.js";
import { ProjectSummary } from "@/features/projects/ProjectSummary";
import { TaskActionSheet } from "@/features/tasks/TaskActionSheet";
import { TaskFilters } from "@/features/tasks/TaskFilters";
import { TaskItem } from "@/features/tasks/TaskItem";
import { useTasks } from "@/features/tasks/taskQueries.js";
import { useConfirmDeleteTask } from "@/features/tasks/useConfirmDeleteTask.js";
import { useToggleTaskCompleted } from "@/features/tasks/useToggleTaskCompleted.js";
import { usePullToRefresh } from "@/lib/usePullToRefresh.js";
import { colors, radius, spacing } from "@/theme";

const NO_FILTERS = { search: "", status: "", priority: "" };

function TaskListStatus({ query, hasFilters, onClearFilters, onCreate }) {
  const { data, error, isFetching, refetch } = query;

  // A failed refetch keeps the old cached rows, which may include deleted or changed tasks, so the error wins.
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} retrying={isFetching} />;
  if (!data) return <LoadingState label="Loading tasks…" />;
  if (hasFilters) {
    return (
      <EmptyState
        icon={SearchX}
        title="No tasks found"
        message="Try a different search or filter."
        action={
          <Button variant="outline" onPress={onClearFilters}>
            Clear filters
          </Button>
        }
      />
    );
  }
  return (
    <EmptyState
      icon={ListTodo}
      title="No tasks yet"
      message="Add a task to this project."
      action={
        <Button icon={Plus} onPress={onCreate}>
          Add Task
        </Button>
      }
    />
  );
}

function ProjectDetails({ project, refetchProject }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState(NO_FILTERS);
  const [menu, setMenu] = useState(null);
  const hasFilters = Boolean(filters.search || filters.status || filters.priority);

  const tasksQuery = useTasks({ projectId: project.id, ...filters });
  const { refreshing, onRefresh } = usePullToRefresh(refetchProject, tasksQuery.refetch);
  const { toggle, pendingId } = useToggleTaskCompleted();
  const { confirmDelete } = useConfirmDeleteTask();

  const items = tasksQuery.error ? [] : (tasksQuery.data?.items ?? []);
  const updateFilters = useCallback((changes) => setFilters((current) => ({ ...current, ...changes })), []);
  const handleSearch = useCallback((search) => updateFilters({ search }), [updateFilters]);
  const clearFilters = () => setFilters(NO_FILTERS);

  const openTask = (task) => router.push(`/tasks/${task.id}`);
  // Filters are cleared so the new task is visible when the form closes.
  const createTask = () => {
    clearFilters();
    router.push({ pathname: "/tasks/new", params: { projectId: project.id } });
  };

  return (
    <>
      <FlatList
        data={items}
        keyExtractor={(task) => task.id}
        renderItem={({ item, index }) => (
          <View style={[styles.row, index === 0 && styles.firstRow, index === items.length - 1 && styles.lastRow]}>
            <TaskItem
              task={item}
              onToggle={toggle}
              toggling={pendingId === item.id}
              onOpen={openTask}
              onMenu={(task) => setMenu({ task, view: "main" })}
            />
          </View>
        )}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          <View style={styles.header}>
            <ProjectSummary project={project} />
            <TaskFilters
              filters={filters}
              onChange={updateFilters}
              onSearch={handleSearch}
              hasFilters={hasFilters}
              onClear={clearFilters}
            />
          </View>
        }
        ListEmptyComponent={
          <TaskListStatus query={tasksQuery} hasFilters={hasFilters} onClearFilters={clearFilters} onCreate={createTask} />
        }
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      />
      <Pressable
        onPress={createTask}
        accessibilityRole="button"
        accessibilityLabel="Add task"
        style={({ pressed }) => [styles.fab, { bottom: insets.bottom + spacing.lg }, pressed && styles.fabPressed]}
      >
        <Plus size={26} color="#FFFFFF" aria-hidden />
      </Pressable>
      <TaskActionSheet menu={menu} onChangeMenu={setMenu} onEdit={openTask} onDelete={confirmDelete} />
    </>
  );
}

function ProjectContent({ id }) {
  const { data: project, error, isFetching, refetch } = useProject(id);

  // A confirmed 404 wins over cached data, so a project deleted on the web is never shown.
  if (isNotFound(error)) {
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
  if (project) return <ProjectDetails project={project} refetchProject={refetch} />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} retrying={isFetching} />;
  return <LoadingState label="Loading project…" />;
}

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.screen}>
      <OfflineBanner />
      <ProjectContent key={id} id={id} />
    </View>
  );
}

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, flexGrow: 1 },
  header: { gap: spacing.xl, marginBottom: spacing.lg },
  row: {
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  firstRow: { borderTopWidth: 1, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card },
  lastRow: { borderBottomWidth: 1, borderBottomLeftRadius: radius.card, borderBottomRightRadius: radius.card },
  separator: { height: 1, backgroundColor: colors.border },
  fab: {
    position: "absolute",
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabPressed: { backgroundColor: colors.primaryHover },
});
