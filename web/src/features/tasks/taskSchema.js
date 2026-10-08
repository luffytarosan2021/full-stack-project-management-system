import { z } from "zod";
import { changedFields, dateField, descriptionField } from "@/lib/formSchemas.js";
import { TASK_PRIORITY_VALUES, TASK_STATUS_VALUES } from "./taskOptions.js";

export const TASK_FIELDS = ["name", "description", "priority", "status", "dueDate"];

// Mirrors the backend rules and messages (docs/VALIDATION.md section 4). Past due dates are allowed.
export const taskFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150, "Name must be at most 150 characters"),
  description: descriptionField(2000),
  priority: z.enum(TASK_PRIORITY_VALUES, { error: "Priority must be one of Low, Medium, High" }),
  status: z.enum(TASK_STATUS_VALUES, { error: "Status must be one of Pending, In Progress, Completed" }),
  dueDate: dateField("Due date"),
});

export const toFormValues = (task) => ({
  name: task?.name ?? "",
  description: task?.description ?? "",
  priority: task?.priority ?? "MEDIUM",
  status: task?.status ?? "PENDING",
  dueDate: task?.dueDate ?? "",
});

// projectId always comes from the project being viewed, never from the form.
export function toCreateBody(projectId, { description, ...values }) {
  return description === null ? { projectId, ...values } : { projectId, ...values, description };
}

// Only editable fields that changed: never id, projectId, projectName or timestamps. A cleared description is null.
export const toUpdateBody = (task, values) => changedFields(task, values, TASK_FIELDS);
