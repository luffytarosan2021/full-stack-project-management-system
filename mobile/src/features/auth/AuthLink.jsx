import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import { AppText } from "@/components/AppText";
import { colors, TOUCH_TARGET } from "@/theme";

// "Don't have an account? Create one" style footer link between Login and Register.
export function AuthLink({ prompt, label, href }) {
  return (
    <>
      <AppText variant="small" muted>
        {prompt}{" "}
      </AppText>
      <Link href={href} replace accessibilityRole="link" style={styles.link}>
        <AppText variant="label" color={colors.primary}>
          {label}
        </AppText>
      </Link>
    </>
  );
}

const styles = StyleSheet.create({
  link: { minHeight: TOUCH_TARGET, paddingVertical: 12 },
});
