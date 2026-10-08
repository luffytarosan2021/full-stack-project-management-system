import { useRef, useState } from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/theme";

// Scrollable form that stays above the keyboard. KeyboardAvoidingView only knows its position
// relative to its parent, so the on-screen offset (header, status bar) is measured and passed in.
// "padding" works on both platforms, including Android edge-to-edge where the window may not resize.
export function FormScrollView({ children, contentStyle }) {
  const insets = useSafeAreaInsets();
  const container = useRef(null);
  const [offset, setOffset] = useState(0);

  const measure = () => container.current?.measureInWindow((_x, y) => setOffset(y));

  return (
    <View ref={container} style={styles.flex} onLayout={measure}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={offset}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }, contentStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg },
});
