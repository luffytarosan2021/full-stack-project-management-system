import { Navigate, Outlet, useLocation } from "react-router";
import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/features/auth/authContext.js";

// Login and register: logged-in users go back to where they were headed, or to the dashboard.
export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <LoadingState fullScreen />;

  if (status === "authenticated") {
    const from = location.state?.from;
    return <Navigate to={from ? `${from.pathname}${from.search}` : "/dashboard"} replace />;
  }

  return <Outlet />;
}
