import { z } from "zod";
import { dateOnly, isRealDate, nullableText, optionalQueryString, requiredString, uuidParam } from "./common.js";

export const PROJECT_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

const status = z.enum(PROJECT_STATUSES, {
  error: (issue) =>
    issue.input === undefined ? "Status is required" : `Status must be one of ${PROJECT_STATUSES.join(", ")}`,
});

const name = requiredString("Name")
  .trim()
  .min(1, "Name is required")
  .max(150, "Name must be at most 150 characters");

const description = nullableText("Description", 2000);

export const END_BEFORE_START_MESSAGE = "End date must be on or after start date";

export const projectIdParams = z.object({ id: uuidParam("Project ID") });

export const listProjectsQuery = z.object({
  search: optionalQueryString("Search").pipe(
    z.string().max(100, "Search must be at most 100 characters").optional(),
  ),
  status: optionalQueryString("Status").pipe(status.optional()),
});

export const createProjectSchema = z
  .object({
    name,
    description: description.optional(),
    status,
    startDate: dateOnly("Start date"),
    endDate: dateOnly("End date"),
  })
  .refine(
    ({ startDate, endDate }) => !isRealDate(startDate) || !isRealDate(endDate) || endDate >= startDate,
    { path: ["endDate"], message: END_BEFORE_START_MESSAGE },
  );

export const updateProjectSchema = z
  .object({
    name: name.optional(),
    description: description.optional(),
    status: status.optional(),
    startDate: dateOnly("Start date").optional(),
    endDate: dateOnly("End date").optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided",
  });
