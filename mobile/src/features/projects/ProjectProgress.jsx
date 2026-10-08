import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { colors, radius, spacing } from "@/theme";

// Progress = completedTaskCount / taskCount, both supplied by the API.
export function ProjectProgress({ completed, total }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const summary = total === 0 ? "No tasks yet" : `${completed} of ${total} ${total === 1 ? "task" : "tasks"} completed`;

  return (
    <View
      style={styles.wrapper}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Task progress"
      accessibilityValue={{ min: 0, max: 100, now: percent, text: summary }}
    >
      <View style={styles.labels}>
        <AppText variant="small" muted style={styles.summary}>
          {summary}
        </AppText>
        <AppText variant="label">{percent}%</AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  labels: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  summary: { flex: 1 },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.track, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radius.pill, backgroundColor: colors.primary },
});
