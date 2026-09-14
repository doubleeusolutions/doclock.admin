/**
 * Material 3 / Modern Light Blue Design Tokens
 * Matched precisely with the reference Tailwind specification
 */
export const Colors = {
  // Brand & Core
  primary: '#0059b9',
  primaryContainer: '#2b72d9',
  primaryFixed: '#d7e2ff',
  primaryFixedDim: '#acc7ff',
  onPrimary: '#ffffff',
  onPrimaryFixed: '#001a40',
  onPrimaryFixedVariant: '#004591',

  // Secondary & Tertiary
  secondary: '#006780',
  secondaryContainer: '#68d7fd',
  secondaryFixed: '#b9eaff',
  secondaryFixedDim: '#65d4fa',
  onSecondary: '#ffffff',
  tertiary: '#5b4aba',
  tertiaryContainer: '#7464d5',
  tertiaryFixed: '#e5deff',

  // Surfaces & Backgrounds
  background: '#f9f9ff',
  surface: '#ffffff',
  surfaceBright: '#f9f9ff',
  surfaceDim: '#d0daef',
  surfaceTint: '#005bbd',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  surfaceContainer: '#e7eeff',
  surfaceContainerHigh: '#dfe8fe',
  surfaceContainerHighest: '#d9e3f8',

  // Typography
  onSurface: '#121c2b',
  onSurfaceVariant: '#424753',
  textPrimary: '#121c2b',
  textSecondary: '#424753',
  textMuted: '#5c6068',

  // Borders & Outlines
  outline: '#727784',
  outlineVariant: '#c2c6d5',
  borderLight: '#e2e8f0',
  borderSubtle: 'rgba(226, 232, 240, 0.6)',

  // Specialized card & component colors
  cardResource: '#eaf0ff',
  optionUnselected: '#f0f4fc',
  optionSelected: '#d7e2ff',
  optionSelectedRing: 'rgba(0, 89, 185, 0.25)',

  // Feedback states
  success: '#10b981',
  successContainer: '#d1fae5',
  successText: '#065f46',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  errorText: '#93000a',

  // Disabled states
  disabledSurface: '#e6eff9',
  disabledText: '#93a6be',
  disabledButton: '#c6dcfa',

  // Accents for gradients / backwards compatibility
  accentBlue: '#0059b9',
  accentCyan: '#68d7fd',
  accentViolet: '#7464d5',

  // Overlays & Transparencies
  whiteAlpha90: 'rgba(255, 255, 255, 0.9)',
  whiteAlpha80: 'rgba(255, 255, 255, 0.8)',
  whiteAlpha70: 'rgba(255, 255, 255, 0.7)',
  whiteAlpha20: 'rgba(255, 255, 255, 0.2)',
  primaryAlpha20: 'rgba(0, 89, 185, 0.2)',
  primaryAlpha10: 'rgba(0, 89, 185, 0.1)',
} as const;

export type ColorToken = keyof typeof Colors;
