import { Outlet } from "react-router";
import { AppName } from "@/components/AppName";

export function PublicLayout() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <AppName className="mb-6 flex items-center justify-center gap-2 text-lg font-semibold" />
        <Outlet />
      </div>
    </main>
  );
}
