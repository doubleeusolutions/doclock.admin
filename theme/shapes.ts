/**
 * Material 3 Expressive highly-rounded shapes
 */
export const Shapes = {
  none: 0,
  small: 12,
  medium: 18,
  large: 24,
  extraLarge: 28,
  pill: 999,
} as const;

export type ShapeToken = keyof typeof Shapes;
