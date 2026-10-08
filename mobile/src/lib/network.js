import NetInfo from "@react-native-community/netinfo";

// `isInternetReachable` is null until NetInfo has checked, so only an explicit `false` counts as offline.
export const isOnlineState = (state) => state.isConnected === true && state.isInternetReachable !== false;

export async function checkOnline() {
  try {
    return isOnlineState(await NetInfo.fetch());
  } catch {
    return false;
  }
}
