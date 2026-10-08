import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { colors, radius, spacing, TOUCH_TARGET } from "@/theme";
import { AppText } from "./AppText";

// Single-select chips with an "All" option (docs/DESIGN.md section 8). "" means no filter.
export function FilterChips({ label, options, value, onChange, allLabel = "All" }) {
  const choices = [{ value: "", label: allLabel }, ...options];

  return (
    <View style={styles.group}>
      <AppText variant="captionMedium" muted>
        {label}
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {choices.map((choice) => {
          const selected = choice.value === value;
          return (
            <Pressable
              key={choice.value || "all"}
              onPress={() => onChange(choice.value)}
              accessibilityRole="radio"
              aria-checked={selected}
              accessibilityLabel={`${label}: ${choice.label}`}
              hitSlop={{ top: 6, bottom: 6 }}
              style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && !selected && styles.pressed]}
            >
              <AppText variant="label" color={selected ? colors.primary : colors.text}>
                {choice.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  row: { gap: spacing.sm, paddingVertical: 2 },
  chip: {
    minHeight: TOUCH_TARGET - 8,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  pressed: { backgroundColor: colors.bg },
});
