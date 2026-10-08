import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { setSessionInvalidHandler } from "@/lib/apiClient.js";
import { MESSAGES } from "@/lib/messages.js";
import { tokenStorage } from "@/lib/tokenStorage.js";
import { authApi } from "./authApi.js";
import { AuthContext } from "./authContext.js";

export const ME_QUERY_KEY = ["auth", "me"];

// Screens worth reopening after logging in again (a half-filled "new task" form is not).
const canReturnTo = (path) => /^\/(projects|tasks)\/[^/]+$/.test(path) && path !== "/tasks/new";

// "restoring": SecureStore has not been read yet. Authenticated screens never render before this resolves.
function getStatus(token, user, isError) {
  if (token === undefined) return "restoring";
  if (!token) return "unauthenticated";
  if (user) return "authenticated";
  if (isError) return "error";
  return "loading";
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  const [token, setToken] = useState(undefined);
  const [notice, setNotice] = useState(null);
  const [returnTo, setReturnTo] = useState(null);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    tokenStorage.getToken().then(setToken, () => setToken(null));
  }, []);

  // Restores the session on launch. A rejected token is removed by the API client, which then
  // calls the session-invalid handler below; a network failure keeps the token and shows "error".
  const { data: user = null, error, isError, isFetching, refetch } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: authApi.me,
    enabled: Boolean(token),
    staleTime: 60_000,
  });

  const startSession = useCallback(
    async ({ token: newToken, user: newUser }) => {
      await tokenStorage.setToken(newToken);
      queryClient.setQueryData(ME_QUERY_KEY, newUser);
      setToken(newToken);
      setNotice(null);
      setReturnTo((current) => (current?.userId === newUser.id ? current : null));
    },
    [queryClient],
  );

  const endSession = useCallback(
    async (nextNotice) => {
      await tokenStorage.removeToken().catch(() => {});
      setToken(null);
      queryClient.clear();
      setNotice(nextNotice);
    },
    [queryClient],
  );

  useEffect(() => {
    setSessionInvalidHandler((code) => {
      const userId = queryClient.getQueryData(ME_QUERY_KEY)?.id;
      const path = pathnameRef.current;
      setReturnTo(userId && canReturnTo(path) ? { userId, path } : null);
      endSession(code === "TOKEN_EXPIRED" ? MESSAGES.sessionExpired : MESSAGES.sessionInvalid);
    });
    return () => setSessionInvalidHandler(null);
  }, [endSession, queryClient]);

  // Logout is client-side: local state is cleared first, whatever the server answers.
  const logout = useCallback(async () => {
    const currentToken = await tokenStorage.getToken().catch(() => null);
    setReturnTo(null);
    await endSession(MESSAGES.loggedOut);
    if (currentToken) authApi.logout(currentToken).catch(() => {});
  }, [endSession]);

  const clearNotice = useCallback(() => setNotice(null), []);

  // Returns the screen open when the session expired (once), if it belonged to this user.
  const consumeReturnTo = useCallback(() => {
    const target = returnTo?.userId === user?.id ? returnTo?.path : null;
    setReturnTo(null);
    return target;
  }, [returnTo, user]);

  const value = useMemo(
    () => ({
      status: getStatus(token, user, isError),
      user,
      error,
      retry: refetch,
      retrying: isFetching,
      notice,
      clearNotice,
      startSession,
      logout,
      consumeReturnTo,
    }),
    [token, user, isError, error, refetch, isFetching, notice, clearNotice, startSession, logout, consumeReturnTo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
