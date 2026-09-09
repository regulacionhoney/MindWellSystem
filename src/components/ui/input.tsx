import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  help?: string;
};

export function Input({ className, error, help, ...props }: InputProps) {
  return (
    <div>
      <input
        className={cn(
          "w-full rounded-md border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2",
          error ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-100",
          className,
        )}
        {...props}
      />
      {help && !error && <p className="mt-1 text-xs text-gray-500">{help}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}