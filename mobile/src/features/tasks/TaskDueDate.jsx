import { CalendarDays } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { formatDate } from "@/lib/dates.js";
import { colors } from "@/theme";
import { isOverdue } from "./taskOptions.js";

// Overdue due dates use the danger color plus the word "Overdue" (docs/DESIGN.md section 3).
export function TaskDueDate({ task }) {
  const overdue = isOverdue(task);
  const color = overdue ? colors.danger : colors.textMuted;
  const text = `Due ${formatDate(task.dueDate)}${overdue ? " · Overdue" : ""}`;

  return (
    <View style={styles.row} accessible accessibilityLabel={text}>
      <CalendarDays size={14} color={color} aria-hidden />
      <AppText variant={overdue ? "captionMedium" : "caption"} color={color}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
});
