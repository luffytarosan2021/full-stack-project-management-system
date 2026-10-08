import NetInfo from "@react-native-community/netinfo";
import { focusManager, onlineManager, QueryClient } from "@tanstack/react-query";
import { AppState } from "react-native";
import { isNoResponse } from "./apiError.js";
import { isOnlineState } from "./network.js";

// One NetInfo listener for the whole app: TanStack Query refetches active queries when the
// connection comes back (no polling), and the offline banner reads the same state.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(isOnlineState(state))),
);

// Returning to the app counts as "focus", like a browser tab becoming visible.
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener("change", (status) => handleFocus(status === "active"));
  return () => subscription.remove();
});

// Retry once for network or server failures; never retry 4xx (an expired token must not be re-sent).
const shouldRetry = (failureCount, error) => failureCount < 1 && (isNoResponse(error) || error?.status >= 500);

export const queryClient = new QueryClient({
  defaultOptions: {
    // "always": requests still run while offline, so screens show the no-network error with
    // "Try again" instead of a spinner that waits forever.
    queries: { retry: shouldRetry, networkMode: "always" },
    mutations: { retry: false, networkMode: "always" },
  },
});
