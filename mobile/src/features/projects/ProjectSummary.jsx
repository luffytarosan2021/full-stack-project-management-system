import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatTimestamp } from "@/lib/dates.js";
import { cardShadow, colors, radius, spacing } from "@/theme";
import { ProjectProgress } from "./ProjectProgress";

function DetailItem({ label, value }) {
  return (
    <View style={styles.detail} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

// Read-only project header on Project Details (mobile never edits projects).
export function ProjectSummary({ project }) {
  const { name, description, status, startDate, endDate, createdAt, taskCount, completedTaskCount } = project;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppText variant="section" accessibilityRole="header" style={styles.name}>
          {name}
        </AppText>
        <StatusBadge status={status} />
      </View>
      {description ? (
        <AppText variant="small">{description}</AppText>
      ) : (
        <AppText variant="small" muted style={styles.italic}>
          No description.
        </AppText>
      )}
      <View style={styles.details}>
        <DetailItem label="Start date" value={formatDate(startDate)} />
        <DetailItem label="End date" value={formatDate(endDate)} />
        <DetailItem label="Created" value={formatTimestamp(createdAt)} />
      </View>
      <ProjectProgress completed={completedTaskCount} total={taskCount} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...cardShadow,
  },
  header: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  name: { flex: 1 },
  italic: { fontStyle: "italic" },
  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  detail: { gap: 2, minWidth: 96 },
});
