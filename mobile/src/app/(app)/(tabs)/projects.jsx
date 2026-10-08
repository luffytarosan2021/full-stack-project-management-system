import { useRouter } from "expo-router";
import { FolderKanban, SearchX } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { FilterChips } from "@/components/FilterChips";
import { OfflineBanner } from "@/components/OfflineBanner";
import { SearchInput } from "@/components/SearchInput";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { ProjectCard } from "@/features/projects/ProjectCard";
import { useProjects } from "@/features/projects/projectQueries.js";
import { PROJECT_STATUSES } from "@/features/projects/projectStatus.js";
import { usePullToRefresh } from "@/lib/usePullToRefresh.js";
import { colors, spacing } from "@/theme";

function ListStatus({ query, hasFilters, onClearFilters }) {
  const { data, error, isFetching, refetch } = query;

  // A failed refetch keeps old cached cards (possibly deleted on the web), so the error wins.
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} retrying={isFetching} />;
  if (!data) return <LoadingState label="Loading projects…" />;
  if (hasFilters) {
    return (
      <EmptyState
        icon={SearchX}
        title="No projects found"
        message="Try a different search or filter."
        action={
          <Button variant="outline" onPress={onClearFilters}>
            Clear filters
          </Button>
        }
      />
    );
  }
  // Projects are created on the web app (docs/DESIGN.md section 6).
  return <EmptyState icon={FolderKanban} title="No projects yet" message="Create your first project to get started." />;
}

export default function ProjectsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const hasFilters = Boolean(search || status);

  const query = useProjects({ search, status });
  const { refreshing, onRefresh } = usePullToRefresh(query.refetch);
  const items = query.error ? [] : (query.data?.items ?? []);

  const handleSearch = useCallback((value) => setSearch(value), []);
  const clearFilters = () => {
    setSearch("");
    setStatus("");
  };

  return (
    <View style={styles.screen}>
      <OfflineBanner />
      <FlatList
        data={items}
        keyExtractor={(project) => project.id}
        renderItem={({ item }) => <ProjectCard project={item} onPress={() => router.push(`/projects/${item.id}`)} />}
        ListHeaderComponent={
          <View style={styles.toolbar}>
            <SearchInput value={search} onSearch={handleSearch} label="Search projects" />
            <FilterChips label="Status" options={PROJECT_STATUSES} value={status} onChange={setStatus} />
          </View>
        }
        ListEmptyComponent={<ListStatus query={query} hasFilters={hasFilters} onClearFilters={clearFilters} />}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={Separator}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      />
    </View>
  );
}

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, flexGrow: 1 },
  toolbar: { gap: spacing.md, marginBottom: spacing.lg },
  separator: { height: spacing.md },
});
