import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/lib/messages.js";
import { cn } from "@/lib/utils";

export function ErrorState({ message = MESSAGES.generic, onRetry, retrying = false, fullScreen = false }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-4 py-12 text-center",
        fullScreen && "min-h-svh",
      )}
    >
      <CircleAlert className="size-8 text-destructive" aria-hidden="true" />
      <p className="max-w-sm text-sm text-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry} disabled={retrying}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
