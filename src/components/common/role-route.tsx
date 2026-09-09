import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

export function RoleRoute({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    const target = user.role === "admin" ? "/admin/dashboard" : `/${user.role}/dashboard`;
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}