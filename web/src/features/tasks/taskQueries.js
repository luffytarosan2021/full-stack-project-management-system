import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DASHBOARD_QUERY_KEY } from "@/features/dashboard/useDashboardStats.js";
import { projectKeys } from "@/features/projects/projectQueries.js";
import { tasksApi } from "./tasksApi.js";

export const taskKeys = {
  all: ["tasks"],
  lists: () => [...taskKeys.all, "list"],
  list: (filters) => [...taskKeys.lists(), filters],
  detail: (id) => [...taskKeys.all, "detail", id],
};

export function useTasks(filters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => tasksApi.list(filters),
    // Keep the current rows on screen while a new search/filter loads.
    placeholderData: keepPreviousData,
  });
}

export function useTask(id) {
  return useQuery({ queryKey: taskKeys.detail(id), queryFn: () => tasksApi.get(id) });
}

// Task changes move the project's taskCount/completedTaskCount and the dashboard totals, so those
// are refetched from the API rather than recalculated here.
const refreshAfterTaskChange = (queryClient, taskQuery) =>
  Promise.all([
    queryClient.invalidateQueries(taskQuery),
    queryClient.invalidateQueries({ queryKey: projectKeys.all }),
    queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY }),
  ]);

// Create (no task) or update (only the changed fields). Also used to mark a task completed.
// `callbacks` live on the mutation itself, so they still run if the row unmounts after a filter change.
export function useSaveTask(task, callbacks = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => (task ? tasksApi.update(task.id, body) : tasksApi.create(body)),
    onSuccess: async (saved) => {
      await refreshAfterTaskChange(queryClient, { queryKey: taskKeys.all });
      callbacks.onSuccess?.(saved);
    },
    onError: callbacks.onError,
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.remove,
    onSuccess: (_result, id) => {
      // A details page that is still open is navigating away, so its query must not refetch (it would 404).
      queryClient.removeQueries({ queryKey: taskKeys.detail(id), type: "inactive" });
      return Promise.all([
        refreshAfterTaskChange(queryClient, { queryKey: taskKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(id), refetchType: "none" }),
      ]);
    },
  });
}
