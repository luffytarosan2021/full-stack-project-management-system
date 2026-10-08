import { Navigate, Outlet, useLocation } from "react-router";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/features/auth/authContext.js";

export function ProtectedRoute() {
  const { status, error, retry } = useAuth();
  const location = useLocation();

  if (status === "loading") return <LoadingState label="Loading your account…" fullScreen />;
  if (status === "error") return <ErrorState message={error?.message} onRetry={() => retry()} fullScreen />;
  if (status === "unauthenticated") return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
