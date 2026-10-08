import { Check, EllipsisVertical } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatTimestamp } from "@/lib/dates.js";
import { colors, spacing, TOUCH_TARGET } from "@/theme";
import { TaskDueDate } from "./TaskDueDate";

// One task row: checkbox quick action, details (tap to edit, long-press for the menu) and a menu button.
export function TaskItem({ task, onToggle, toggling, onOpen, onMenu }) {
  const completed = task.status === "COMPLETED";

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onToggle(task)}
        disabled={toggling}
        accessibilityRole="checkbox"
        aria-checked={completed}
        aria-busy={toggling}
        accessibilityLabel={completed ? `Mark "${task.name}" as pending` : `Mark "${task.name}" as completed`}
        style={styles.touch}
      >
        {toggling ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View style={[styles.checkbox, completed && styles.checked]}>
            {completed ? <Check size={14} color="#FFFFFF" strokeWidth={3} aria-hidden /> : null}
          </View>
        )}
      </Pressable>

      <Pressable
        onPress={() => onOpen(task)}
        onLongPress={() => onMenu(task)}
        accessibilityRole="button"
        accessibilityLabel={`Edit task ${task.name}`}
        accessibilityHint="Long-press for more actions"
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <AppText
          variant="bodyMedium"
          numberOfLines={2}
          color={completed ? colors.textMuted : colors.text}
          style={completed && styles.completedName}
        >
          {task.name}
        </AppText>
        <View style={styles.badges}>
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </View>
        <TaskDueDate task={task} />
        <AppText variant="caption" muted>
          Created {formatTimestamp(task.createdAt)}
        </AppText>
      </Pressable>

      <Pressable
        onPress={() => onMenu(task)}
        accessibilityRole="button"
        accessibilityLabel={`More actions for ${task.name}`}
        style={styles.touch}
      >
        <EllipsisVertical size={20} color={colors.textMuted} aria-hidden />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  touch: { width: TOUCH_TARGET, height: TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  checked: { backgroundColor: colors.success, borderColor: colors.success },
  body: { flex: 1, minWidth: 0, gap: 6, paddingVertical: spacing.sm, paddingRight: spacing.xs, borderRadius: 8 },
  pressed: { backgroundColor: colors.bg },
  completedName: { textDecorationLine: "line-through" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
