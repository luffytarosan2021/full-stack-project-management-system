import { CircleCheck, Clock, FolderClock, FolderKanban, ListChecks } from "lucide-react-native";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { FormAlert } from "@/components/FormAlert";
import { OfflineBanner } from "@/components/OfflineBanner";
import { StatCard } from "@/components/StatCard";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { useAuth } from "@/features/auth/authContext.js";
import { useDashboardStats } from "@/features/dashboard/dashboardQueries.js";
import { usePullToRefresh } from "@/lib/usePullToRefresh.js";
import { useRefreshOnFocus } from "@/lib/useRefreshOnFocus.js";
import { colors, spacing } from "@/theme";

// Order and labels from docs/DESIGN.md section 5 ("Dashboard cards"). Values come straight from the API.
const STATS = [
  { key: "totalProjects", label: "Total Projects", icon: FolderKanban, tone: "primary" },
  { key: "totalTasks", label: "Total Tasks", icon: ListChecks, tone: "primary" },
  { key: "completedTasks", label: "Completed Tasks", icon: CircleCheck, tone: "green" },
  { key: "pendingTasks", label: "Pending Tasks", icon: Clock, tone: "neutral" },
  { key: "projectsInProgress", label: "Projects In Progress", icon: FolderClock, tone: "blue" },
];

function DashboardStats({ data, error, isFetching, refetch }) {
  if (data) {
    return (
      <View style={styles.stats}>
        {/* A failed refresh keeps the last numbers but says they could not be updated. */}
        <FormAlert>{error?.message}</FormAlert>
        {STATS.map(({ key, ...stat }) => (
          <StatCard key={key} value={data[key]} {...stat} />
        ))}
      </View>
    );
  }
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} retrying={isFetching} />;
  return <LoadingState label="Loading dashboard…" />;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const query = useDashboardStats();
  const { refreshing, onRefresh } = usePullToRefresh(query.refetch);
  useRefreshOnFocus(query.refetch);

  return (
    <View style={styles.screen}>
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <AppText variant="title" accessibilityRole="header" numberOfLines={2}>
            Welcome, {user?.fullName}
          </AppText>
          <AppText variant="small" muted>
            An overview of your projects and tasks.
          </AppText>
        </View>
        <DashboardStats {...query} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.xl },
  header: { gap: spacing.xs },
  stats: { gap: spacing.md },
});
