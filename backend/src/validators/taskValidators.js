import { z } from "zod";
import { dateOnly, nullableText, optionalQueryString, requiredString, uuidParam } from "./common.js";

export const TASK_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const requiredEnum = (label, values) =>
  z.enum(values, {
    error: (issue) => (issue.input === undefined ? `${label} is required` : `${label} must be one of ${values.join(", ")}`),
  });

const status = requiredEnum("Status", TASK_STATUSES);
const priority = requiredEnum("Priority", TASK_PRIORITIES);

const name = requiredString("Name")
  .trim()
  .min(1, "Name is required")
  .max(150, "Name must be at most 150 characters");

const description = nullableText("Description", 2000);

export const taskIdParams = z.object({ id: uuidParam("Task ID") });

export const listTasksQuery = z.object({
  projectId: optionalQueryString("Project ID").pipe(uuidParam("Project ID").optional()),
  search: optionalQueryString("Search").pipe(
    z.string().max(100, "Search must be at most 100 characters").optional(),
  ),
  status: optionalQueryString("Status").pipe(status.optional()),
  priority: optionalQueryString("Priority").pipe(priority.optional()),
});

export const createTaskSchema = z.object({
  projectId: z.uuid({
    error: (issue) => (issue.input === undefined ? "Project ID is required" : "Project ID must be a valid UUID"),
  }),
  name,
  description: description.optional(),
  priority,
  status,
  dueDate: dateOnly("Due date"),
});

// projectId is not listed: tasks cannot move between projects, so it is stripped like any unknown field.
export const updateTaskSchema = z
  .object({
    name: name.optional(),
    description: description.optional(),
    priority: priority.optional(),
    status: status.optional(),
    dueDate: dateOnly("Due date").optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided",
  });
