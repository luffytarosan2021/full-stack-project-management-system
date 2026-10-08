import { MESSAGES } from "./messages.js";

export const NETWORK_ERROR = "NETWORK_ERROR";

export class ApiError extends Error {
  constructor({ status = 0, code, message, fields = [] }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

// Turns any Axios failure into an ApiError with a message that is safe to show to users.
export function toApiError(error) {
  if (error instanceof ApiError) return error;

  if (!error.response) {
    return new ApiError({ code: NETWORK_ERROR, message: MESSAGES.noNetwork });
  }

  const { status, data } = error.response;
  const body = data?.error;

  if (status >= 500 || typeof body?.code !== "string") {
    return new ApiError({ status, code: body?.code ?? "INTERNAL_SERVER_ERROR", message: MESSAGES.generic });
  }

  return new ApiError({
    status,
    code: body.code,
    message: status === 429 ? MESSAGES.rateLimited : (body.message ?? MESSAGES.generic),
    fields: Array.isArray(body.details?.fields) ? body.details.fields : [],
  });
}
