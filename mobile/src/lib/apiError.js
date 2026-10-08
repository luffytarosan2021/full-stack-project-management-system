import { MESSAGES } from "./messages.js";

export const NETWORK_ERROR = "NETWORK_ERROR";
export const SERVER_UNREACHABLE = "SERVER_UNREACHABLE";

export class ApiError extends Error {
  constructor({ status = 0, code, message, fields = [] }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export const isNoResponse = (error) => error?.code === NETWORK_ERROR || error?.code === SERVER_UNREACHABLE;

// Turns any Axios failure into an ApiError with a message that is safe to show to users.
// `isOnline` separates "the phone is offline" from "the phone is online but the API did not answer".
export function toApiError(error, { isOnline = false } = {}) {
  if (error instanceof ApiError) return error;

  if (!error?.response) {
    return isOnline
      ? new ApiError({ code: SERVER_UNREACHABLE, message: MESSAGES.generic })
      : new ApiError({ code: NETWORK_ERROR, message: MESSAGES.noNetwork });
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
