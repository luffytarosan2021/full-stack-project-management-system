import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { setSessionInvalidHandler } from "@/lib/apiClient.js";
import { MESSAGES } from "@/lib/messages.js";
import { tokenStorage } from "@/lib/tokenStorage.js";
import { authApi } from "./authApi.js";
import { AuthContext } from "./authContext.js";

const ME_QUERY_KEY = ["auth", "me"];

function getStatus(token, user, isError) {
  if (!token) return "unauthenticated";
  if (user) return "authenticated";
  if (isError) return "error";
  return "loading";
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(tokenStorage.get);
  const [notice, setNotice] = useState(null);

  // Restores the session on reload; a rejected token is cleared by the API client.
  const { data: user = null, error, isError, refetch } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: authApi.me,
    enabled: Boolean(token),
    staleTime: 60_000,
  });

  const startSession = useCallback(
    ({ token: newToken, user }) => {
      tokenStorage.set(newToken);
      queryClient.setQueryData(ME_QUERY_KEY, user);
      setToken(newToken);
      setNotice(null);
    },
    [queryClient],
  );

  const endSession = useCallback(
    (nextNotice) => {
      tokenStorage.clear();
      setToken(null);
      queryClient.clear();
      setNotice(nextNotice);
    },
    [queryClient],
  );

  useEffect(() => {
    setSessionInvalidHandler((code) => endSession(code === "TOKEN_EXPIRED" ? MESSAGES.sessionExpired : null));
    return () => setSessionInvalidHandler(null);
  }, [endSession]);

  // Logout is client-side: local state is cleared first, whatever the server answers.
  const logout = useCallback(() => {
    const currentToken = tokenStorage.get();
    endSession(MESSAGES.loggedOut);
    if (currentToken) authApi.logout(currentToken).catch(() => {});
  }, [endSession]);

  const clearNotice = useCallback(() => setNotice(null), []);

  const value = useMemo(
    () => ({
      status: getStatus(token, user, isError),
      user,
      error,
      retry: refetch,
      notice,
      clearNotice,
      startSession,
      logout,
    }),
    [token, user, isError, error, refetch, notice, clearNotice, startSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
