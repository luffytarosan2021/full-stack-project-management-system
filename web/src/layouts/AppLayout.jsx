import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { APP_NAME } from "@/components/AppName";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/authContext.js";
import { AppNav } from "./AppNav";

const MOBILE_NAV_ID = "mobile-navigation";

// Sidebar: dark forest green panel (lg+). Top bar: white strip with search and user avatar.
export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
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

  // First two initials of the user's name for the avatar
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="flex min-h-svh">
      {/* ── Sidebar (lg+) ── */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col border-r bg-surface">
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-2 px-6 mt-2">
          <span className="size-3 grid place-items-center rounded-sm bg-primary/20 shrink-0" aria-hidden="true">
             <span className="size-1.5 rounded-sm bg-primary shrink-0" />
          </span>
          <Link
            to="/dashboard"
            className="min-w-0 text-[15px] font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded"
          >
            {APP_NAME}
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 px-4 py-2">
          <AppNav label="Main" />
        </div>

        {/* User info + logout */}
        <div className="p-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground" title={user?.fullName}>
                {user?.fullName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Logout"
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Right column: top bar + page content ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-card px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile/tablet) */}
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
            {/* Brand (mobile only — sidebar hidden) */}
            <Link
              to="/dashboard"
              className="lg:hidden min-w-0 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span className="flex items-center gap-2 text-base font-semibold tracking-tight">
                <span className="size-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Right side of top bar */}
          <div className="flex shrink-0 items-center gap-3">
            <span
              className="hidden sm:flex size-8 items-center justify-center rounded-full text-xs font-semibold cursor-default"
              style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
              title={user?.fullName}
              aria-label={`Logged in as ${user?.fullName}`}
            >
              {initials}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Logout" className="text-muted-foreground hover:text-foreground">
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline text-sm">Logout</span>
            </Button>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {menuOpen ? (
          <div
            id={MOBILE_NAV_ID}
            className="border-b px-4 py-3 sm:px-6 lg:hidden"
            style={{ backgroundColor: "var(--sidebar)" }}
          >
            <p className="truncate px-3 pb-3 text-sm text-white/60 sm:hidden">
              Signed in as <span className="font-medium text-white/90">{user?.fullName}</span>
            </p>
            <AppNav label="Main" onNavigate={() => setMenuOpenOn(null)} />
          </div>
        ) : null}

        {/* Page content */}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
