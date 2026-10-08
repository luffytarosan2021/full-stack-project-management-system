import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { colors, fonts, radius, spacing, TOUCH_TARGET } from "@/theme";
import { AppText } from "./AppText";

// Label, input and the validation message directly under it (docs/DESIGN.md section 7).
export function TextField({ label, error, hint, multiline = false, style, onFocus, onBlur, ref, ...inputProps }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.field, style]}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...inputProps}
        style={[styles.input, multiline && styles.multiline, focused && styles.focused, error && styles.invalid]}
      />
      {error ? (
        <AppText variant="caption" color={colors.danger} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" muted>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: {
    minHeight: TOUCH_TARGET,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  multiline: { minHeight: 104 },
  focused: { borderColor: colors.primary },
  invalid: { borderColor: colors.danger },
});
