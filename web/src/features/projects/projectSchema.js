import { z } from "zod";
import { isRealDate } from "@/lib/dates.js";
import { changedFields, dateField, descriptionField } from "@/lib/formSchemas.js";
import { PROJECT_STATUS_VALUES } from "./projectStatus.js";

export const PROJECT_FIELDS = ["name", "description", "status", "startDate", "endDate"];

// Mirrors the backend rules and messages (docs/VALIDATION.md sections 3 and 6).
export const projectFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(150, "Name must be at most 150 characters"),
    description: descriptionField(2000),
    status: z.enum(PROJECT_STATUS_VALUES, { error: "Status must be one of Not Started, In Progress, Completed" }),
    startDate: dateField("Start date"),
    endDate: dateField("End date"),
  })
  .refine(
    ({ startDate, endDate }) => !isRealDate(startDate) || !isRealDate(endDate) || endDate >= startDate,
    { path: ["endDate"], message: "End date must be on or after start date" },
  );

export const toFormValues = (project) => ({
  name: project?.name ?? "",
  description: project?.description ?? "",
  status: project?.status ?? "NOT_STARTED",
  startDate: project?.startDate ?? "",
  endDate: project?.endDate ?? "",
});

export function toCreateBody({ description, ...values }) {
  return description === null ? values : { ...values, description };
}

// A cleared description is sent as null.
export const toUpdateBody = (project, values) => changedFields(project, values, PROJECT_FIELDS);
