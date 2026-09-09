import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { titleCase } from "@/lib/format";

const toneMap: Record<string, string> = {
  primary: "bg-slate-800 text-white",
  secondary: "bg-gray-100 text-gray-600",
  success: "bg-emerald-100 text-emerald-800",
  info: "bg-blue-100 text-blue-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
  muted: "bg-gray-100 text-gray-500",
};

export type Tone = keyof typeof toneMap;

// eslint-disable-next-line react-refresh/only-export-components
export const statusToTone: Record<string, Tone> = {
  pending: "warning",
  reviewed: "info",
  approved: "success",
  confirmed: "success",
  completed: "info",
  cancelled: "danger",
  closed: "muted",
  low: "muted",
  medium: "info",
  high: "warning",
  urgent: "danger",
  active: "success",
  inactive: "danger",
  student: "info",
  counselor: "success",
  admin: "primary",
  published: "success",
  draft: "warning",
  read: "muted",
  unread: "info",
};

type StatusBadgeProps = {
  value: string;
  tone?: Tone;
  children?: ReactNode;
  className?: string;
};

export function StatusBadge({ value, tone, children, className }: StatusBadgeProps) {
  const resolvedTone = tone ?? statusToTone[value.toLowerCase()] ?? "secondary";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneMap[resolvedTone],
        className,
      )}
    >
      {children ?? titleCase(value)}
    </span>
  );
}