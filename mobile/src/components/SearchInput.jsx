import { Search, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { colors, fonts, radius, spacing, TOUCH_TARGET } from "@/theme";

const DEBOUNCE_MS = 300;

// Debounced search field (docs/DESIGN.md section 8). `value` is the applied search; typing updates it
// 300 ms after the last keystroke, and external changes (e.g. "Clear filters") reset the text.
export function SearchInput({ value, onSearch, label, maxLength = 100 }) {
  const [text, setText] = useState(value);
  const [appliedValue, setAppliedValue] = useState(value);

  if (value !== appliedValue) {
    setAppliedValue(value);
    if (value !== text.trim()) setText(value);
  }

  useEffect(() => {
    const next = text.trim();
    if (next === value) return undefined;
    const timer = setTimeout(() => onSearch(next), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, value, onSearch]);

  const clear = () => {
    setText("");
    onSearch("");
  };

  return (
    <View style={styles.wrapper}>
      <Search size={18} color={colors.textMuted} style={styles.icon} aria-hidden />
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={label}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        maxLength={maxLength}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={styles.input}
      />
      {text ? (
        <Pressable onPress={clear} accessibilityRole="button" accessibilityLabel="Clear search" style={styles.clear}>
          <X size={18} color={colors.textMuted} aria-hidden />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: TOUCH_TARGET,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
  },
  icon: { marginLeft: spacing.md },
  input: {
    flex: 1,
    minHeight: TOUCH_TARGET,
    paddingHorizontal: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  clear: { width: TOUCH_TARGET, height: TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
});
