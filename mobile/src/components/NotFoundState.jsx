import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { spacing } from "@/theme";
import { Button } from "./Button";
import { EmptyState } from "./StateViews";

// 404 (missing, deleted, or owned by someone else; the API does not say which) or 400 (malformed id).
export const isNotFound = (error) => error?.status === 404 || error?.status === 400;

export function NotFoundState({ icon, title, message, backLabel, backHref }) {
  const router = useRouter();
  // Pops back to the screen if it is already in the history; otherwise replaces this one with it.
  const goBack = () => router.dismissTo(backHref);

  return (
    <View style={styles.container}>
      <EmptyState
        icon={icon}
        title={title}
        message={message}
        action={
          <Button variant="outline" onPress={goBack}>
            {backLabel}
          </Button>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
});
