import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Disabled while the request runs so a form cannot be submitted twice (docs/DESIGN.md section 8).
export function SubmitButton({ pending, pendingLabel, children, size = "lg", className = "w-full" }) {
  return (
    <Button type="submit" size={size} className={className} disabled={pending} aria-busy={pending}>
      {pending ? (
        <>
          <LoaderCircle className="animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
