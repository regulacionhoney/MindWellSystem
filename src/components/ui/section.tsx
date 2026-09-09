import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionProps = {
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
};

export function Section({ children, fullWidth = false, className }: SectionProps) {
  return (
    <section className={cn("mx-auto px-4 py-10", fullWidth ? "w-full" : "max-w-7xl", className)}>
      {children}
    </section>
  );
}