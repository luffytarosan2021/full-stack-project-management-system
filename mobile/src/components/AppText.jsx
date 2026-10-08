import { StyleSheet, Text } from "react-native";
import { colors, fonts } from "@/theme";

// Type scale from docs/DESIGN.md: page title 24, section title 18, body 14 to 16, caption 12.
const variants = StyleSheet.create({
  title: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 32 },
  section: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  captionMedium: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
});

export function AppText({ variant = "body", muted = false, color, style, ...props }) {
  return (
    <Text
      style={[variants[variant], { color: color ?? (muted ? colors.textMuted : colors.text) }, style]}
      maxFontSizeMultiplier={1.6}
      {...props}
    />
  );
}
