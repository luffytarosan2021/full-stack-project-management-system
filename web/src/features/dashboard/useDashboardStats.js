import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./dashboardApi.js";

// Invalidate this key after project or task changes so the counts refresh.
export const DASHBOARD_QUERY_KEY = ["dashboard"];

// Refetches on page load and window focus (docs/DESIGN.md section 8) via the QueryClient defaults.
export function useDashboardStats() {
  return useQuery({ queryKey: DASHBOARD_QUERY_KEY, queryFn: dashboardApi.getStats });
}
