import type { ReactNode } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: string;
  className?: string;
};

export function StatCard({ label, value, icon, tone = "text-emerald-600", className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardBody className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">{value}</p>
        </div>
        {icon && (
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl",
              tone,
            )}
          >
            {icon}
          </div>
        )}
      </CardBody>
    </Card>
  );
}