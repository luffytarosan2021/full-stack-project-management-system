import { FolderKanban } from "lucide-react";

export const APP_NAME = "Project Management System";

export function AppName({ className }) {
  return (
    <span className={className}>
      <FolderKanban className="size-5 shrink-0 text-primary" aria-hidden="true" />
      <span className="truncate">{APP_NAME}</span>
    </span>
  );
}
