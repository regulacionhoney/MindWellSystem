import { useState } from "react";
import { Outlet } from "react-router";
import { Navbar } from "@/components/common/navbar";
import { Sidebar } from "@/components/common/sidebar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/cn";
import type { UserRole } from "@/types";

export function AppLayout() {
  const { user } = useAuth();
  const role = (user?.role ?? "student") as UserRole;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-transparent">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 -translate-x-full shadow-lg transition-transform lg:static lg:translate-x-0 lg:shadow-none",
          sidebarOpen && "translate-x-0",
        )}
      >
        <Sidebar role={role} onNavigate={() => setSidebarOpen(false)} />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}