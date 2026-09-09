import { NavLink } from "react-router";
import type { IconName } from "@/components/ui/icon";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { UserRole } from "@/types";

export type NavItem = {
  to: string;
  label: string;
  icon: IconName;
};

// eslint-disable-next-line react-refresh/only-export-components
export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  student: [
    { to: "/student/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/student/counseling-request", label: "Counseling Request", icon: "clipboard" },
    { to: "/student/appointments", label: "Events", icon: "calendar" },
    { to: "/student/resources", label: "Resources", icon: "book" },
    { to: "/student/notifications", label: "Notifications", icon: "bell" },
  ],
  counselor: [
    { to: "/counselor/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/counselor/requests", label: "Requests", icon: "clipboard" },
    { to: "/counselor/appointments", label: "Appointments", icon: "calendar" },
    { to: "/counselor/records", label: "Records", icon: "file" },
    { to: "/counselor/follow-ups", label: "Follow-Ups", icon: "follow-up" },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/admin/users", label: "Users", icon: "users" },
    { to: "/admin/counselors", label: "Counselors", icon: "user" },
    { to: "/admin/resources", label: "Resources", icon: "book" },
    { to: "/admin/reports", label: "Reports", icon: "chart" },
    { to: "/admin/settings", label: "Settings", icon: "settings" },
  ],
};

type SidebarContentProps = {
  role: UserRole;
  onNavigate?: () => void;
};

function SidebarLinks({ role, onNavigate }: SidebarContentProps) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {NAV_ITEMS[role].map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-emerald-50 text-emerald-800"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            )
          }
        >
          <Icon name={item.icon} className="size-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar({ role, onNavigate }: SidebarContentProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-emerald-800 px-4 py-4 text-white">
        <span className="flex size-9 items-center justify-center overflow-hidden rounded-lg bg-white shadow-md">
          <img src="/mindwell-logo.png" alt="MindWell" className="size-9 object-contain" />
        </span>
        <div>
          <p className="text-sm font-bold tracking-tight">MindWell</p>
          <p className="text-xs capitalize text-emerald-100">{role}</p>
        </div>
      </div>
      <SidebarLinks role={role} onNavigate={onNavigate} />
    </aside>
  );
}