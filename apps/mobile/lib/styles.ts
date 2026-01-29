import { StyleSheet } from "react-native";
import { colors, spacing, radius, fontSizes, fontWeights, shadows } from "./theme";

export const layout = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  column: {
    flexDirection: "column",
  },
  wrap: {
    flexWrap: "wrap",
  },
});

export const containers = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.subtle,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  surface: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});

export const typography = StyleSheet.create({
  display: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.bold,
    color: colors.text,
    letterSpacing: -1,
  },
  h1: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  h3: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  body: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    color: colors.text,
  },
  bodyMuted: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    color: colors.textMuted,
  },
  caption: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    color: colors.textSubtle,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mono: {
    fontSize: fontSizes.md,
    fontFamily: "Menlo",
    color: colors.text,
  },
});

export const buttons = StyleSheet.create({
  primary: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.accent,
  },
  primaryText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.background,
  },
  secondary: {
    backgroundColor: colors.subtle,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  ghost: {
    backgroundColor: colors.transparent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.textMuted,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.subtle,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export const inputs = StyleSheet.create({
  container: {
    backgroundColor: colors.subtle,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  placeholder: {
    color: colors.textSubtle,
  },
  focused: {
    borderColor: colors.accent,
  },
  error: {
    borderColor: colors.error,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
});

export const lists = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.subtle,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  separator: {
    height: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});

export const badges = StyleSheet.create({
  default: {
    backgroundColor: colors.subtle,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  accent: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  text: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  accentText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.background,
  },
});

export const utils = StyleSheet.create({
  absolute: {
    position: "absolute",
  },
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hidden: {
    opacity: 0,
  },
  disabled: {
    opacity: 0.5,
  },
});
