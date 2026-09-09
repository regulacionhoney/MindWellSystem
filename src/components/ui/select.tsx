import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
};

export function Select({ className, error, children, ...props }: SelectProps) {
  return (
    <div>
      <select
        className={cn(
          "w-full cursor-pointer rounded-md border bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2",
          error ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-100",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}