// Exact enum values accepted by the API (docs/VALIDATION.md section 3); labels from docs/DESIGN.md.
export const PROJECT_STATUSES = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

export const PROJECT_STATUS_VALUES = PROJECT_STATUSES.map((status) => status.value);
