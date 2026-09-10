import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  help?: string;
};

export function PasswordInput({ className, error, help, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          className={cn(
            "w-full rounded-md border px-3 py-2 pr-10 text-sm transition-all focus:outline-none focus:ring-2",
            error
              ? "border-red-400 focus:ring-red-200"
              : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-100",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
        >
          <Icon name={visible ? "eye-off" : "eye"} className="size-4" />
        </button>
      </div>
      {help && !error && <p className="mt-1 text-xs text-gray-500">{help}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}