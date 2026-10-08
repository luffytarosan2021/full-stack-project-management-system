import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DASHBOARD_QUERY_KEY } from "@/features/dashboard/useDashboardStats.js";
import { projectsApi } from "./projectsApi.js";

export const projectKeys = {
  all: ["projects"],
  lists: () => [...projectKeys.all, "list"],
  list: (filters) => [...projectKeys.lists(), filters],
  detail: (id) => [...projectKeys.all, "detail", id],
};

export function useProjects(filters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => projectsApi.list(filters),
    // Keep the current cards on screen while a new search/filter loads.
    placeholderData: keepPreviousData,
  });
}

export function useProject(id) {
  return useQuery({ queryKey: projectKeys.detail(id), queryFn: () => projectsApi.get(id) });
}

// Create (no project) or update (only the changed fields). Project counts feed the dashboard too.
export function useSaveProject(project) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => (project ? projectsApi.update(project.id, body) : projectsApi.create(body)),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: projectKeys.all }),
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY }),
      ]),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.remove,
    onSuccess: (_result, id) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY }),
        // The deleted project's details must not be refetched (it would 404 while navigating away).
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(id), refetchType: "none" }),
      ]),
  });
}
