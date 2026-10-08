import axios from "axios";
import { env } from "@/config/env.js";
import { toApiError } from "./apiError.js";
import { tokenStorage } from "./tokenStorage.js";

const SESSION_ERROR_CODES = new Set(["TOKEN_EXPIRED", "UNAUTHORIZED"]);

const client = axios.create({
  baseURL: env.apiUrl,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

let onSessionInvalid = null;

// AuthProvider registers this to clear React state when the server rejects the stored token.
export function setSessionInvalidHandler(handler) {
  onSessionInvalid = handler;
}

client.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    const token = tokenStorage.get();
    const sentStoredToken = token && error.config?.headers?.get("Authorization") === `Bearer ${token}`;

    // Only the first rejection of the current token ends the session, so the message shows once.
    if (apiError.status === 401 && SESSION_ERROR_CODES.has(apiError.code) && sentStoredToken) {
      tokenStorage.clear();
      onSessionInvalid?.(apiError.code);
    }

    return Promise.reject(apiError);
  },
);

const unwrap = (response) => response.data.data;

// The single entry point for API calls: resolves with the `data` payload, rejects with an ApiError.
export const api = {
  get: (url, config) => client.get(url, config).then(unwrap),
  post: (url, body, config) => client.post(url, body, config).then(unwrap),
  put: (url, body, config) => client.put(url, body, config).then(unwrap),
  delete: (url, config) => client.delete(url, config).then(unwrap),
};
