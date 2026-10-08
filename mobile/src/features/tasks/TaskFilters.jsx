import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { FilterChips } from "@/components/FilterChips";
import { SearchInput } from "@/components/SearchInput";
import { spacing } from "@/theme";
import { TASK_PRIORITIES, TASK_STATUSES } from "./taskOptions.js";

// Task toolbar on Project Details: debounced search plus status and priority chips.
export function TaskFilters({ filters, onChange, onSearch, hasFilters, onClear }) {
  return (
    <View style={styles.toolbar}>
      <View style={styles.heading}>
        <AppText variant="section" accessibilityRole="header">
          Tasks
        </AppText>
        {hasFilters ? (
          <Button variant="ghost" onPress={onClear}>
            Clear filters
          </Button>
        ) : null}
      </View>
      <SearchInput value={filters.search} onSearch={onSearch} label="Search tasks" />
      <FilterChips label="Status" options={TASK_STATUSES} value={filters.status} onChange={(status) => onChange({ status })} />
      <FilterChips
        label="Priority"
        options={TASK_PRIORITIES}
        value={filters.priority}
        onChange={(priority) => onChange({ priority })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { gap: spacing.md },
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 },
});
