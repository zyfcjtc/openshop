export const THEME_COLORS = [
  "emerald",
  "blue",
  "rose",
  "amber",
  "violet",
  "slate",
  "teal",
  "orange",
] as const;

export type ThemeColor = (typeof THEME_COLORS)[number];

export function getThemeColor(): ThemeColor {
  const color = process.env.NEXT_PUBLIC_THEME_COLOR || "emerald";
  return THEME_COLORS.includes(color as ThemeColor)
    ? (color as ThemeColor)
    : "emerald";
}
