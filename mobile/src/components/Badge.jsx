import { StyleSheet, View } from "react-native";
import { radius, tones } from "@/theme";
import { AppText } from "./AppText";

// Pill with a text label: colors are never the only signal (docs/DESIGN.md section 1).
export function Badge({ label, tone = "neutral", accessibilityLabel }) {
  const { color, backgroundColor, dot } = tones[tone];

  return (
    <View style={[styles.badge, { backgroundColor }]} accessible accessibilityLabel={accessibilityLabel ?? label}>
      <View style={[styles.dot, { backgroundColor: dot }]} aria-hidden="true" />
      <AppText variant="captionMedium" color={color} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
