import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient.js";

// The mobile app only reads projects (docs/DESIGN.md section 6); they are managed on the web.
export const projectKeys = {
  all: ["projects"],
  lists: () => [...projectKeys.all, "list"],
  list: (filters) => [...projectKeys.lists(), filters],
  detail: (id) => [...projectKeys.all, "detail", id],
};

const projectPath = (id) => `/projects/${encodeURIComponent(id)}`;

export function useProjects({ search, status }) {
  return useQuery({
    queryKey: projectKeys.list({ search, status }),
    // Empty filters are omitted rather than sent as `?search=` (docs/API.md section 6).
    queryFn: () => api.get("/projects", { params: { search: search || undefined, status: status || undefined } }),
    // Keep the current cards on screen while a new search/filter loads.
    placeholderData: keepPreviousData,
  });
}

export function useProject(id) {
  return useQuery({ queryKey: projectKeys.detail(id), queryFn: () => api.get(projectPath(id)), enabled: Boolean(id) });
}
