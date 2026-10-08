import { CalendarDays } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatTimestamp } from "@/lib/dates.js";
import { cardShadow, colors, radius, spacing } from "@/theme";
import { ProjectProgress } from "./ProjectProgress";

// Read-only project summary; tapping opens Project Details.
export function ProjectCard({ project, onPress }) {
  const { name, description, status, startDate, endDate, taskCount, completedTaskCount, createdAt } = project;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open project ${name}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <AppText variant="section" numberOfLines={2} style={styles.name}>
          {name}
        </AppText>
        <StatusBadge status={status} />
      </View>
      {description ? (
        <AppText variant="small" muted numberOfLines={2}>
          {description}
        </AppText>
      ) : null}
      <View style={styles.dates} accessible accessibilityLabel={`Dates: ${formatDate(startDate)} to ${formatDate(endDate)}`}>
        <CalendarDays size={16} color={colors.textMuted} aria-hidden />
        <AppText variant="small" muted style={styles.flex}>
          {formatDate(startDate)} – {formatDate(endDate)}
        </AppText>
      </View>
      <ProjectProgress completed={completedTaskCount} total={taskCount} />
      <AppText variant="caption" muted>
        Created {formatTimestamp(createdAt)}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...cardShadow,
  },
  pressed: { borderColor: "#A5B4FC" },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md },
  name: { flex: 1, fontSize: 16, lineHeight: 22 },
  dates: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  flex: { flex: 1 },
});
