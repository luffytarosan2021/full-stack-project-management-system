import { AppError } from "../utils/AppError.js";

const toFieldErrors = (issues, rootField) =>
  issues.map((issue) => {
    if (issue.path.length > 0) return { field: issue.path.join("."), message: issue.message };
    const message = issue.code === "invalid_type" ? "Request body must be a JSON object" : issue.message;
    return { field: rootField, message };
  });

function validate(schema, source, target) {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        new AppError(400, "VALIDATION_ERROR", "Invalid request", {
          fields: toFieldErrors(result.error.issues, source),
        }),
      );
    }
    req[target] = result.data;
    return next();
  };
}

export const validateBody = (schema) => validate(schema, "body", "validatedBody");
export const validateParams = (schema) => validate(schema, "params", "validatedParams");
export const validateQuery = (schema) => validate(schema, "query", "validatedQuery");
