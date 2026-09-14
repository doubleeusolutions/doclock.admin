import { TextStyle, Platform } from 'react-native';
import { Colors } from './colors';

const FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const Typography: Record<string, TextStyle> = {
  // Display & Greetings
  displayLarge: {
    fontFamily: FONT_FAMILY,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  displayMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  // Headlines
  headlineMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  headlineSmall: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Titles
  titleLarge: {
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  titleMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  titleSmall: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.1,
  },

  // Body text
  bodyLarge: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: Colors.textPrimary,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  bodySmall: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
  },

  // Labels & Buttons
  labelLarge: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
};
