import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient.js";

// Invalidate this key after task changes so the counts refresh.
export const DASHBOARD_QUERY_KEY = ["dashboard"];

export function useDashboardStats() {
  return useQuery({ queryKey: DASHBOARD_QUERY_KEY, queryFn: () => api.get("/dashboard") });
}
