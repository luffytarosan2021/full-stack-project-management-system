import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SessionErrorScreen } from "@/components/SessionErrorScreen";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { ToastProvider } from "@/components/ToastProvider";
import { envError } from "@/config/env.js";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { useAuth } from "@/features/auth/authContext.js";
import { queryClient } from "@/lib/queryClient.js";
import { colors } from "@/theme";

// Authenticated screens render only once the stored session is confirmed by GET /api/auth/me.
function RootNavigator() {
  const { status } = useAuth();

  if (status === "restoring" || status === "loading") {
    return (
      <View style={styles.center}>
        <LoadingState label="Loading…" />
      </View>
    );
  }
  if (status === "error") return <SessionErrorScreen />;

  const authenticated = status === "authenticated";

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={authenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!authenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Screen name="+not-found" options={{ headerShown: true, title: "Not found" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold });

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {envError ? (
        <View style={styles.center}>
          <ErrorState message={envError} />
        </View>
      ) : !fontsLoaded && !fontError ? null : (
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: "center" },
});
