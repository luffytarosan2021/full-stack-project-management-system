import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DASHBOARD_QUERY_KEY } from "@/features/dashboard/dashboardQueries.js";
import { projectKeys } from "@/features/projects/projectQueries.js";
import { api } from "@/lib/apiClient.js";

export const taskKeys = {
  all: ["tasks"],
  lists: () => [...taskKeys.all, "list"],
  list: (filters) => [...taskKeys.lists(), filters],
  detail: (id) => [...taskKeys.all, "detail", id],
};

const taskPath = (id) => `/tasks/${encodeURIComponent(id)}`;

export function useTasks({ projectId, search, status, priority }) {
  return useQuery({
    queryKey: taskKeys.list({ projectId, search, status, priority }),
    // projectId is always sent; empty filters are omitted (docs/API.md section 7).
    queryFn: () =>
      api.get("/tasks", {
        params: { projectId, search: search || undefined, status: status || undefined, priority: priority || undefined },
      }),
    // Keep the current rows on screen while a new search/filter loads.
    placeholderData: keepPreviousData,
  });
}

export function useTask(id) {
  return useQuery({ queryKey: taskKeys.detail(id), queryFn: () => api.get(taskPath(id)) });
}

// Task changes move the project's taskCount/completedTaskCount and the dashboard totals, so those
// are refetched from the API rather than recalculated here.
const refreshAfterTaskChange = (queryClient, taskQuery = { queryKey: taskKeys.all }) =>
  Promise.all([
    queryClient.invalidateQueries(taskQuery),
    queryClient.invalidateQueries({ queryKey: projectKeys.all }),
    queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY }),
  ]);

// A 404 means the task (or its project) was deleted elsewhere, e.g. on the web: refetch so the
// screens show "not found" instead of stale data.
const refreshIfMissing = (queryClient) => (error) => {
  if (error?.status === 404) refreshAfterTaskChange(queryClient);
};

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post("/tasks", body),
    onSuccess: () => refreshAfterTaskChange(queryClient),
    onError: refreshIfMissing(queryClient),
  });
}

// Callbacks live on the mutation itself, so they still run if a row unmounts after a filter change.
export function useUpdateTask({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }) => api.put(taskPath(id), changes),
    onSuccess: async (saved) => {
      await refreshAfterTaskChange(queryClient);
      onSuccess?.(saved);
    },
    onError: (error) => {
      refreshIfMissing(queryClient)(error);
      onError?.(error);
    },
  });
}

export function useDeleteTask({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(taskPath(id)),
    onSuccess: async (_result, id) => {
      // An open edit screen is navigating away, so its query must not refetch (it would 404).
      queryClient.removeQueries({ queryKey: taskKeys.detail(id), type: "inactive" });
      await Promise.all([
        refreshAfterTaskChange(queryClient, { queryKey: taskKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(id), refetchType: "none" }),
      ]);
      onSuccess?.();
    },
    onError: (error) => {
      refreshIfMissing(queryClient)(error);
      onError?.(error);
    },
  });
}
