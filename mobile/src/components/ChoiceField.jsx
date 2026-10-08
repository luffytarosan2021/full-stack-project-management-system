import { Pressable, StyleSheet, View } from "react-native";
import { colors, radius, spacing, TOUCH_TARGET } from "@/theme";
import { AppText } from "./AppText";

// Segmented single choice for short enum fields (priority, status) in forms.
export function ChoiceField({ label, options, value, onChange, error }) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              aria-checked={selected}
              accessibilityLabel={`${label}: ${option.label}`}
              style={({ pressed }) => [styles.option, selected && styles.selected, pressed && !selected && styles.pressed]}
            >
              <AppText variant="label" color={selected ? colors.primary : colors.text} numberOfLines={1}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  row: { flexDirection: "row", gap: spacing.sm },
  option: {
    flex: 1,
    minHeight: TOUCH_TARGET,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  pressed: { backgroundColor: colors.bg },
});
