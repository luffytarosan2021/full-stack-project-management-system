import { api } from "@/lib/apiClient.js";

// Request bodies are built field by field so unknown form values are never sent.
export const authApi = {
  login: ({ email, password }) => api.post("/auth/login", { email, password }),
  register: ({ fullName, email, password }) => api.post("/auth/register", { fullName, email, password }),
  me: () => api.get("/auth/me"),
  // Called after local state is cleared, so the token is passed explicitly.
  logout: (token) => api.post("/auth/logout", undefined, { headers: { Authorization: `Bearer ${token}` } }),
};
