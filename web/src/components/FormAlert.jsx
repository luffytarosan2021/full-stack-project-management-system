import { CircleAlert, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Banner above a form: "error" for failed requests, "info" for notices such as logout.
export function FormAlert({ tone = "error", children }) {
  if (!children) return null;
  const Icon = tone === "error" ? CircleAlert : Info;

  return (
    <Alert variant={tone === "error" ? "destructive" : "default"} aria-live="polite">
      <Icon />
      <AlertDescription className={tone === "error" ? undefined : "text-foreground"}>{children}</AlertDescription>
    </Alert>
  );
}
