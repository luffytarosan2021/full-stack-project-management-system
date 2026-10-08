import { Folders, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  // Not `end`, so /projects/:id keeps "Projects" highlighted.
  { to: "/projects", label: "Projects", icon: Folders },
];

const ITEM =
  "flex h-10 items-center gap-3 rounded-md px-3 text-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export function AppNav({ label, className, onNavigate }) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="grid gap-1">
        {ITEMS.map(({ to, label: itemLabel, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  ITEM,
                  isActive
                    ? "bg-primary-soft font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {itemLabel}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
