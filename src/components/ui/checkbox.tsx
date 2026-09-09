import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: string;
};

export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  const resolvedId = id ?? props.name;
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700", className)}>
      <input
        id={resolvedId}
        type="checkbox"
        className="size-4 cursor-pointer rounded border-gray-300 text-emerald-600 accent-emerald-700"
        {...props}
      />
      {label}
    </label>
  );
}