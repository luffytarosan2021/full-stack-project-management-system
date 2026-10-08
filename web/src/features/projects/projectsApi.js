import { api } from "@/lib/apiClient.js";

const projectPath = (id) => `/projects/${encodeURIComponent(id)}`;

export const projectsApi = {
  // Empty filters are omitted rather than sent as `?search=` (docs/API.md section 6).
  list: ({ search, status }) =>
    api.get("/projects", { params: { search: search || undefined, status: status || undefined } }),
  get: (id) => api.get(projectPath(id)),
  create: (body) => api.post("/projects", body),
  update: (id, changes) => api.put(projectPath(id), changes),
  remove: (id) => api.delete(projectPath(id)),
};
