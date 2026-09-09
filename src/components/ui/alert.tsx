import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AlertProps = {
  variant?: "error" | "success" | "info";
  children: ReactNode;
  className?: string;
};

const variants = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export function Alert({ variant = "info", children, className }: AlertProps) {
  return (
    <div className={cn("rounded-md border px-4 py-3 text-sm", variants[variant], className)} role="alert">
      {children}
    </div>
  );
}