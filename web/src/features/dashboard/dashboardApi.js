import { api } from "@/lib/apiClient.js";

export const dashboardApi = {
  getStats: () => api.get("/dashboard"),
};
