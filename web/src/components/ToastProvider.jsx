import { CircleAlert, CircleCheck, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ToastContext } from "./toastContext.js";

const VISIBLE_MS = 4000;

// Feedback such as "Project saved." (success) or a failed quick action (error).
// The live region is always mounted so new messages are announced.
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    (message, { tone = "success" } = {}) => setToast({ id: crypto.randomUUID(), message, tone }),
    [],
  );

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const Icon = toast?.tone === "error" ? CircleAlert : CircleCheck;

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {toast ? (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm shadow-sm sm:w-auto sm:max-w-sm sm:min-w-72"
          >
            <Icon
              className={toast.tone === "error" ? "size-4 shrink-0 text-destructive" : "size-4 shrink-0 text-success"}
              aria-hidden="true"
            />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss"
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}
