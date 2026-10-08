import { Folders, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router";

const ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  // Not `end`, so /projects/:id keeps "Projects" highlighted.
  { to: "/projects", label: "Projects", icon: Folders },
];

export function AppNav({ label, className, onNavigate }) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="grid gap-0.5">
        {ITEMS.map(({ to, label: itemLabel, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? " active" : ""}`
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
