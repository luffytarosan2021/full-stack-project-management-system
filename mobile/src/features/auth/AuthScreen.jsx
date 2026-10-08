import { FolderKanban } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { FormScrollView } from "@/components/FormScrollView";
import { cardShadow, colors, radius, spacing } from "@/theme";

// Shared frame for Login and Register: app name, a centered card, and a footer link.
export function AuthScreen({ title, description, children, footer }) {
  const insets = useSafeAreaInsets();

  return (
    <FormScrollView contentStyle={[styles.content, { paddingTop: insets.top + spacing.xxl }]}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <FolderKanban size={20} color={colors.primary} aria-hidden />
        </View>
        <AppText variant="bodyMedium">Project Management System</AppText>
      </View>
      <View style={styles.card}>
        <View style={styles.heading}>
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="small" muted>
            {description}
          </AppText>
        </View>
        {children}
      </View>
      <View style={styles.footer}>{footer}</View>
    </FormScrollView>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: "center", width: "100%", maxWidth: 480, alignSelf: "center" },
  brand: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  logo: {
    width: 36,
    height: 36,
    borderRadius: radius.control,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...cardShadow,
  },
  heading: { gap: spacing.xs },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap" },
});
