import { QueryClient } from "@tanstack/react-query";
import { NETWORK_ERROR } from "./apiError.js";

// Retry once for network or server failures; never retry 4xx (an expired token must not be re-sent).
const shouldRetry = (failureCount, error) =>
  failureCount < 1 && (error?.code === NETWORK_ERROR || error?.status >= 500);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetry },
    mutations: { retry: false },
  },
});
