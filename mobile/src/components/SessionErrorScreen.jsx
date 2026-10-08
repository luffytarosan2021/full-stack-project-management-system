import { StyleSheet, View } from "react-native";
import { useAuth } from "@/features/auth/authContext.js";
import { spacing } from "@/theme";
import { Button } from "./Button";
import { ErrorState } from "./StateViews";

// The saved session could not be checked (offline or server error). The token is kept, so
// "Try again" restores the session once the connection is back; logging out is still possible.
export function SessionErrorScreen() {
  const { error, retry, retrying, logout } = useAuth();

  return (
    <View style={styles.container}>
      <ErrorState message={error?.message} onRetry={() => retry()} retrying={retrying}>
        <Button variant="ghost" onPress={logout}>
          Log out
        </Button>
      </ErrorState>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: spacing.lg },
});
