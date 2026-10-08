import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

function toAppError(err) {
  if (err instanceof AppError) return err;

  // Errors raised by express.json() (body-parser) carry a `type` and a 4xx status.
  if (err.type === "entity.too.large") {
    return new AppError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  }
  if (err.type === "entity.parse.failed") {
    return new AppError(400, "VALIDATION_ERROR", "Invalid request", {
      fields: [{ field: "body", message: "Malformed JSON" }],
    });
  }
  if (err.type && err.status >= 400 && err.status < 500) {
    return new AppError(400, "VALIDATION_ERROR", "Invalid request", {
      fields: [{ field: "body", message: "Invalid request body" }],
    });
  }

  if (err.name === "PrismaClientKnownRequestError") {
    if (err.code === "P2002") return new AppError(409, "CONFLICT", "Resource already exists.");
    if (err.code === "P2025") return new AppError(404, "NOT_FOUND", "Resource not found.");
  }

  return null;
}

// Express identifies error handlers by their four-argument signature, so `next` must stay.
export function errorHandler(err, req, res, next) {
  const appError = toAppError(err);

  if (!appError) {
    logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err);
    return res.status(500).json({
      error: { code: "INTERNAL_SERVER_ERROR", message: GENERIC_MESSAGE },
    });
  }

  const body = { error: { code: appError.code, message: appError.message } };
  if (appError.details !== undefined) body.error.details = appError.details;

  return res.status(appError.statusCode).json(body);
}
