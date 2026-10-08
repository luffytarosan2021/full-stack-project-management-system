import * as SecureStore from "expo-secure-store";

// The JWT is persisted only in SecureStore (Android Keystore / iOS Keychain), never AsyncStorage or files
// (docs/SECURITY.md section 14). The in-memory copy just avoids a native call on every request. Never log it.
const TOKEN_KEY = "pms.authToken";

let cached;

export const tokenStorage = {
  async getToken() {
    if (cached === undefined) cached = await SecureStore.getItemAsync(TOKEN_KEY);
    return cached;
  },
  async setToken(token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    cached = token;
  },
  async removeToken() {
    cached = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
