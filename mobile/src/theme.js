// Design tokens from docs/DESIGN.md section 2, shared with the web app.
export const colors = Object.freeze({
  primary: "#4F46E5",
  primaryHover: "#4338CA",
  primarySoft: "#EEF2FF",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  textMuted: "#64748B",
  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
  success: "#16A34A",
  track: "#F1F5F9",
});

// Badge tones (text on background) for statuses and priorities.
export const tones = Object.freeze({
  neutral: { color: "#475569", backgroundColor: "#F1F5F9" },
  blue: { color: "#1D4ED8", backgroundColor: "#DBEAFE" },
  green: { color: "#15803D", backgroundColor: "#DCFCE7" },
  amber: { color: "#B45309", backgroundColor: "#FEF3C7" },
  red: { color: "#B91C1C", backgroundColor: "#FEE2E2" },
  primary: { color: colors.primary, backgroundColor: colors.primarySoft },
});

// Inter needs one font family per weight on Android (fontWeight alone does not pick the file).
export const fonts = Object.freeze({
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
});

export const radius = Object.freeze({ control: 8, card: 12, pill: 999 });

export const spacing = Object.freeze({ xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 });

// Minimum touch target from docs/DESIGN.md section 1.
export const TOUCH_TARGET = 44;

// "Very light shadow" for cards; elevation 1 is the Android equivalent.
export const cardShadow = Object.freeze({
  shadowColor: "#0F172A",
  shadowOpacity: 0.04,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
});
