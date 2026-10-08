import { StyleSheet, View } from "react-native";
import { cardShadow, colors, radius, spacing, tones } from "@/theme";
import { AppText } from "./AppText";

const numberFormat = new Intl.NumberFormat();

// One dashboard statistic: icon chip and label on the left, the API value on the right.
export function StatCard({ label, value, icon: Icon, tone = "primary" }) {
  const { color, backgroundColor } = tones[tone];

  return (
    <View style={styles.card} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.label}>
        <View style={[styles.chip, { backgroundColor }]}>
          <Icon size={18} color={color} aria-hidden />
        </View>
        <AppText variant="small" muted style={styles.flex}>
          {label}
        </AppText>
      </View>
      <AppText variant="title" style={styles.value}>
        {numberFormat.format(value)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...cardShadow,
  },
  label: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md },
  chip: { width: 36, height: 36, borderRadius: radius.control, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
  value: { fontVariant: ["tabular-nums"] },
});
