import { api } from "@/lib/apiClient.js";

const taskPath = (id) => `/tasks/${encodeURIComponent(id)}`;

export const tasksApi = {
  // Empty filters are omitted rather than sent as `?search=` (docs/API.md section 7).
  list: ({ projectId, search, status, priority }) =>
    api.get("/tasks", {
      params: { projectId, search: search || undefined, status: status || undefined, priority: priority || undefined },
    }),
  get: (id) => api.get(taskPath(id)),
  create: (body) => api.post("/tasks", body),
  update: (id, changes) => api.put(taskPath(id), changes),
  remove: (id) => api.delete(taskPath(id)),
};
