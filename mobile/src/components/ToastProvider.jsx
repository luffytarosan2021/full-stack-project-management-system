import { CircleAlert, CircleCheck } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/theme";
import { AppText } from "./AppText";
import { ToastContext } from "./toastContext.js";

const DURATION_MS = 3000;

// Short confirmation shown above the tab bar / bottom inset (e.g. "Task saved.").
export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback((message, { tone = "success" } = {}) => {
    clearTimeout(timer.current);
    setToast({ message, tone, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const Icon = toast?.tone === "error" ? CircleAlert : CircleCheck;
  const iconColor = toast?.tone === "error" ? "#FCA5A5" : "#86EFAC";

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast ? (
        <View style={[styles.container, { bottom: insets.bottom + 72 }]}>
          <View key={toast.id} style={styles.toast} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Icon size={18} color={iconColor} aria-hidden />
            <AppText variant="label" color="#FFFFFF" style={styles.text}>
              {toast.message}
            </AppText>
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", left: spacing.lg, right: spacing.lg, alignItems: "center", pointerEvents: "none" },
  toast: {
    maxWidth: 480,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.text,
    borderRadius: radius.control,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: { flexShrink: 1 },
});
