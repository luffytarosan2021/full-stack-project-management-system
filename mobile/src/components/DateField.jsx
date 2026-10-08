import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { CalendarDays } from "lucide-react-native";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { formatDate, isRealDate, toDateString, toPickerDate } from "@/lib/dates.js";
import { colors, radius, spacing, TOUCH_TARGET } from "@/theme";
import { AppText } from "./AppText";

// Native date picker that reads and writes plain "YYYY-MM-DD" strings. The picker works in the
// device's local time, and toDateString reads the same local calendar day back, so nothing shifts.
export function DateField({ label, value, onChange, error }) {
  const hasValue = isRealDate(value);
  const handlePicked = (_event, date) => onChange(toDateString(date));

  if (Platform.OS === "ios") {
    return (
      <View style={styles.field}>
        <AppText variant="label">{label}</AppText>
        <DateTimePicker
          value={toPickerDate(value)}
          mode="date"
          display="compact"
          onValueChange={handlePicked}
          accessibilityLabel={label}
          style={styles.iosPicker}
        />
        <FieldError error={error} />
      </View>
    );
  }

  const open = () =>
    DateTimePickerAndroid.open({ value: toPickerDate(value), mode: "date", onValueChange: handlePicked });

  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${hasValue ? formatDate(value) : "not set"}`}
        accessibilityHint="Opens the date picker"
        style={({ pressed }) => [styles.input, error && styles.invalid, pressed && styles.pressed]}
      >
        <AppText color={hasValue ? colors.text : colors.textMuted} style={styles.value}>
          {hasValue ? formatDate(value) : "Select a date"}
        </AppText>
        <CalendarDays size={18} color={colors.textMuted} aria-hidden />
      </Pressable>
      <FieldError error={error} />
    </View>
  );
}

function FieldError({ error }) {
  if (!error) return null;
  return (
    <AppText variant="caption" color={colors.danger}>
      {error}
    </AppText>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: {
    minHeight: TOUCH_TARGET,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  value: { flex: 1 },
  invalid: { borderColor: colors.danger },
  pressed: { backgroundColor: colors.bg },
  iosPicker: { alignSelf: "flex-start" },
});
