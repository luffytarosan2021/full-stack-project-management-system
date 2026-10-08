import { todayDate } from "@/lib/dates.js";

// Exact enum values accepted by the API (docs/VALIDATION.md section 4); labels from docs/DESIGN.md.
export const TASK_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

export const TASK_PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

export const TASK_STATUS_VALUES = TASK_STATUSES.map((status) => status.value);
export const TASK_PRIORITY_VALUES = TASK_PRIORITIES.map((priority) => priority.value);

// docs/DESIGN.md section 3: due before today and not completed. Both sides are "YYYY-MM-DD" strings.
export const isOverdue = ({ dueDate, status }) => status !== "COMPLETED" && dueDate < todayDate();
