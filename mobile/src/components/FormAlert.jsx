import { CircleAlert, Info } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "@/theme";
import { AppText } from "./AppText";

const TONES = {
  error: { icon: CircleAlert, color: colors.danger, backgroundColor: colors.dangerSoft, borderColor: "#FECACA" },
  info: { icon: Info, color: colors.primary, backgroundColor: colors.primarySoft, borderColor: "#C7D2FE" },
};

// Form-level message (server errors that do not belong to one field, or a session notice).
export function FormAlert({ children, tone = "error" }) {
  if (!children) return null;
  const { icon: Icon, color, ...box } = TONES[tone];

  return (
    <View style={[styles.alert, box]} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Icon size={18} color={color} aria-hidden />
      <AppText variant="small" color={color} style={styles.text}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.control,
    padding: spacing.md,
  },
  text: { flex: 1 },
});
