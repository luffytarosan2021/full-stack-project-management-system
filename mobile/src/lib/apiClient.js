import { create } from "axios";
import { env } from "@/config/env.js";
import { toApiError } from "./apiError.js";
import { checkOnline } from "./network.js";
import { tokenStorage } from "./tokenStorage.js";

const SESSION_ERROR_CODES = new Set(["TOKEN_EXPIRED", "UNAUTHORIZED"]);

const client = create({
  baseURL: env.apiUrl,
  timeout: 20_000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

let onSessionInvalid = null;

// AuthProvider registers this to clear React state when the server rejects the stored token.
export function setSessionInvalidHandler(handler) {
  onSessionInvalid = handler;
}

client.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getToken();
  if (token && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const apiError = toApiError(error, { isOnline: error.response ? true : await checkOnline() });
    const token = await tokenStorage.getToken();
    const sentStoredToken = token && error.config?.headers?.get("Authorization") === `Bearer ${token}`;

    // Only the first rejection of the current token ends the session, so the message shows once.
    // The failed request is never retried with the rejected token.
    if (apiError.status === 401 && SESSION_ERROR_CODES.has(apiError.code) && sentStoredToken) {
      await tokenStorage.removeToken().catch(() => {});
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
