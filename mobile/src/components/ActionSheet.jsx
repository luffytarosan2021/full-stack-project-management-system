import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, TOUCH_TARGET } from "@/theme";
import { AppText } from "./AppText";

// Bottom sheet of actions. Android's back button closes it through onRequestClose.
// `actions`: [{ label, onPress, icon, destructive, disabled }]
export function ActionSheet({ visible, title, actions, onClose }) {
  const insets = useSafeAreaInsets();

  const run = (action) => {
    onClose();
    action.onPress();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close menu" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.sm }]}>
        {title ? (
          <AppText variant="label" muted numberOfLines={2} style={styles.title}>
            {title}
          </AppText>
        ) : null}
        {actions.map((action) => {
          const color = action.destructive ? colors.danger : colors.text;
          const Icon = action.icon;
          return (
            <Pressable
              key={action.label}
              onPress={() => run(action)}
              disabled={action.disabled}
              accessibilityRole="button"
              aria-disabled={Boolean(action.disabled)}
              style={({ pressed }) => [styles.action, pressed && styles.pressed, action.disabled && styles.disabled]}
            >
              {Icon ? <Icon size={20} color={color} aria-hidden /> : null}
              <AppText variant="bodyMedium" color={color}>
                {action.label}
              </AppText>
            </Pressable>
          );
        })}
        <Pressable onPress={onClose} accessibilityRole="button" style={({ pressed }) => [styles.action, styles.cancel, pressed && styles.pressed]}>
          <AppText variant="bodyMedium" muted>
            Cancel
          </AppText>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.4)" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingTop: spacing.sm,
  },
  title: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  action: {
    minHeight: TOUCH_TARGET + 8,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  cancel: { borderTopWidth: 1, borderTopColor: colors.border, justifyContent: "center", marginTop: spacing.xs },
  pressed: { backgroundColor: colors.bg },
  disabled: { opacity: 0.5 },
});
