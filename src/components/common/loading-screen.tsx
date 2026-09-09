import { Spinner } from "@/components/ui/spinner";

export function LoadingScreen({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-8 text-emerald-700" label={label} />
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}