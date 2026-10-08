import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { headerOptions } from "@/config/navigation.js";
import { useAuth } from "@/features/auth/authContext.js";
import { colors } from "@/theme";

// A deep link straight to a project or task still gets the tabs underneath it,
// so the header back button and router.back() always have somewhere to go.
export const unstable_settings = { initialRouteName: "(tabs)" };

export default function AppLayout() {
  const router = useRouter();
  const { consumeReturnTo } = useAuth();

  // After logging in again following an expired session, reopen the screen the user was on.
  // Consuming clears the target, so this navigates at most once.
  useEffect(() => {
    const target = consumeReturnTo();
    if (target) router.push(target);
  }, [consumeReturnTo, router]);

  return (
    <Stack screenOptions={{ ...headerOptions, contentStyle: { backgroundColor: colors.bg } }}>
      {/* The title is what the back button announces on screens pushed above the tabs. */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Home" }} />
      <Stack.Screen name="projects/[id]" options={{ title: "Project" }} />
      <Stack.Screen name="tasks/new" options={{ title: "New task" }} />
      <Stack.Screen name="tasks/[id]" options={{ title: "Edit task" }} />
    </Stack>
  );
}
