/**
 * Spacing system for Material 3 Expressive layout
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  screenPadding: 20,
  gutter: 16,
} as const;

export type SpacingToken = keyof typeof Spacing;
