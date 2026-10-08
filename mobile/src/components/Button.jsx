import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { colors, radius, spacing, TOUCH_TARGET } from "@/theme";
import { AppText } from "./AppText";

const VARIANTS = {
  primary: { base: colors.primary, pressed: colors.primaryHover, text: "#FFFFFF", border: colors.primary },
  outline: { base: colors.surface, pressed: colors.bg, text: colors.text, border: colors.border },
  danger: { base: colors.dangerSoft, pressed: "#FEE2E2", text: colors.danger, border: "#FECACA" },
  ghost: { base: "transparent", pressed: colors.primarySoft, text: colors.primary, border: "transparent" },
};

// While `pending`, the button shows `pendingLabel` and cannot be pressed (prevents double submits).
export function Button({
  children,
  onPress,
  variant = "primary",
  icon: Icon,
  pending = false,
  pendingLabel,
  disabled = false,
  style,
  accessibilityLabel,
}) {
  const tone = VARIANTS[variant];
  const inactive = disabled || pending;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      aria-disabled={inactive}
      aria-busy={pending}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? tone.pressed : tone.base, borderColor: tone.border },
        inactive && styles.inactive,
        style,
      ]}
    >
      <View style={styles.content}>
        {pending ? (
          <ActivityIndicator size="small" color={tone.text} />
        ) : Icon ? (
          <Icon size={18} color={tone.text} aria-hidden />
        ) : null}
        <AppText variant="label" color={tone.text} numberOfLines={1}>
          {pending && pendingLabel ? pendingLabel : children}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: TOUCH_TARGET,
    borderRadius: radius.control,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  content: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  inactive: { opacity: 0.6 },
});
