import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { AppName } from "@/components/AppName";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/authContext.js";
import { AppNav } from "./AppNav";

const MOBILE_NAV_ID = "mobile-navigation";

// Top bar on every size; sidebar from 1024px; below that the sidebar becomes a hamburger menu.
export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // The menu belongs to the page it was opened on, so navigating anywhere closes it.
  const [menuOpenOn, setMenuOpenOn] = useState(null);
  const menuOpen = menuOpenOn === pathname;

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setMenuOpenOn(null);
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-expanded={menuOpen}
              aria-controls={MOBILE_NAV_ID}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMenuOpenOn(menuOpen ? null : pathname)}
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </Button>
            <Link
              to="/dashboard"
              className="min-w-0 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <AppName className="flex min-w-0 items-center gap-2 text-base font-semibold" />
            </Link>
          </div>
          <div className="flex min-w-0 shrink-0 items-center gap-3">
            <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:inline" title={user.fullName}>
              {user.fullName}
            </span>
            <Button variant="outline" onClick={handleLogout} aria-label="Logout">
              <LogOut aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
        {menuOpen ? (
          <div id={MOBILE_NAV_ID} className="border-t px-4 py-3 sm:px-6 lg:hidden">
            <p className="truncate px-3 pb-3 text-sm text-muted-foreground sm:hidden">
              Signed in as <span className="font-medium text-foreground">{user.fullName}</span>
            </p>
            <AppNav label="Main" onNavigate={() => setMenuOpenOn(null)} />
          </div>
        ) : null}
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-r bg-card p-4 lg:block">
          <AppNav label="Main" />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
