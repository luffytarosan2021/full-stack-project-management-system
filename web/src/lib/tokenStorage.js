// The JWT lives in localStorage as a Bearer token (docs/SECURITY.md section 14). Never log it.
const TOKEN_KEY = "pms.authToken";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};
