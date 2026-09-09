import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type PaginationProps = {
  page: number;
  lastPage: number;
  total?: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({ page, lastPage, total, onPageChange, className }: PaginationProps) {
  if (lastPage <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(lastPage, page + 2);
  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return (
    <div className={cn("flex items-center justify-between gap-3 pt-4", className)}>
      {total !== undefined ? (
        <p className="text-sm text-gray-500">{total} item{total === 1 ? "" : "s"}</p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Prev
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? "primary" : "secondary"}
            size="sm"
            className="min-w-9"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}