import { Tabs } from "expo-router";
import { FolderKanban, LayoutDashboard, UserRound } from "lucide-react-native";
import { headerOptions } from "@/config/navigation.js";
import { colors, fonts } from "@/theme";

function tabIcon(Icon) {
  return function TabIcon({ color, size }) {
    return <Icon color={color} size={size} aria-hidden />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        ...headerOptions,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard", tabBarIcon: tabIcon(LayoutDashboard) }} />
      <Tabs.Screen name="projects" options={{ title: "Projects", tabBarIcon: tabIcon(FolderKanban) }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: tabIcon(UserRound) }} />
    </Tabs>
  );
}
