import { LogOut, Mail, UserRound } from "lucide-react-native";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { useAuth } from "@/features/auth/authContext.js";
import { cardShadow, colors, radius, spacing } from "@/theme";

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon size={20} color={colors.textMuted} aria-hidden />
      <View style={styles.rowText}>
        <AppText variant="caption" muted>
          {label}
        </AppText>
        <AppText variant="bodyMedium">{value}</AppText>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <ProfileRow icon={UserRound} label="Name" value={user?.fullName} />
        <View style={styles.divider} />
        <ProfileRow icon={Mail} label="Email" value={user?.email} />
      </View>
      <Button variant="danger" icon={LogOut} onPress={logout}>
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.xl },
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...cardShadow,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg },
  rowText: { flex: 1, gap: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 52 },
});
