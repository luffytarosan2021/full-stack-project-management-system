import { onlineManager } from "@tanstack/react-query";
import { WifiOff } from "lucide-react-native";
import { useSyncExternalStore } from "react";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme";
import { AppText } from "./AppText";

const subscribe = (listener) => onlineManager.subscribe(listener);
const getOnline = () => onlineManager.isOnline();

// Reads the app-wide NetInfo state already wired into TanStack Query (no extra listeners).
export function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, getOnline);
  if (online) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <WifiOff size={16} color={colors.danger} aria-hidden />
      <AppText variant="captionMedium" color={colors.danger} style={styles.text}>
        No internet connection
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderBottomWidth: 1,
    borderBottomColor: "#FECACA",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  text: { flex: 1 },
});
