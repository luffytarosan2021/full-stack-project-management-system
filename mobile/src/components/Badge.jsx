import { StyleSheet, View } from "react-native";
import { radius, tones } from "@/theme";
import { AppText } from "./AppText";

// Pill with a text label: colors are never the only signal (docs/DESIGN.md section 1).
export function Badge({ label, tone = "neutral", accessibilityLabel }) {
  const { color, backgroundColor } = tones[tone];

  return (
    <View style={[styles.badge, { backgroundColor }]} accessible accessibilityLabel={accessibilityLabel ?? label}>
      <AppText variant="captionMedium" color={color} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
});
