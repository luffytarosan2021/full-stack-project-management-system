import { CircleAlert } from "lucide-react-native";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { MESSAGES } from "@/lib/messages.js";
import { colors, radius, spacing } from "@/theme";
import { AppText } from "./AppText";
import { Button } from "./Button";

export function LoadingState({ label = "Loading…" }) {
  return (
    <View style={styles.center} accessible accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText variant="small" muted>
        {label}
      </AppText>
    </View>
  );
}

export function ErrorState({ message = MESSAGES.generic, onRetry, retrying = false, children }) {
  return (
    <View style={styles.center} accessibilityRole="alert">
      <CircleAlert size={32} color={colors.danger} aria-hidden />
      <AppText variant="small" style={styles.message}>
        {message}
      </AppText>
      {onRetry ? (
        <Button variant="outline" onPress={onRetry} pending={retrying}>
          Try again
        </Button>
      ) : null}
      {children}
    </View>
  );
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <View style={[styles.center, styles.card]}>
      {Icon ? <Icon size={32} color={colors.textMuted} aria-hidden /> : null}
      <AppText variant="section" accessibilityRole="header" style={styles.message}>
        {title}
      </AppText>
      <AppText variant="small" muted style={styles.message}>
        {message}
      </AppText>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 48,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
  },
  message: { textAlign: "center", maxWidth: 360 },
  action: { paddingTop: spacing.xs },
});
