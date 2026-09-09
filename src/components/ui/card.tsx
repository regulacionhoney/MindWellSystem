import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn("border-b border-gray-100 px-5 py-4", className)}>{children}</div>;
}

type CardBodyProps = {
  children: ReactNode;
  className?: string;
};

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

type CardFooterProps = {
  children: ReactNode;
  className?: string;
};

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={cn("border-t border-gray-100 px-5 py-3", className)}>{children}</div>;
}

type CardTitleProps = {
  children: ReactNode;
  className?: string;
};

export function CardTitle({ children, className }: CardTitleProps) {
  return <h2 className={cn("text-base font-semibold text-gray-900", className)}>{children}</h2>;
}