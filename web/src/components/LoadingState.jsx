import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({ label = "Loading…", fullScreen = false }) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground",
        fullScreen && "min-h-svh",
      )}
    >
      <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
