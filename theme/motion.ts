import { WithSpringConfig } from 'react-native-reanimated';

/**
 * Spring motion configurations inspired by Material 3 Expressive
 */
export const Motion = {
  // Snappy tactile response for buttons and pills
  tactileSpring: {
    damping: 15,
    stiffness: 280,
    mass: 0.6,
  } as WithSpringConfig,

  // Fluid transition for selections and expansions
  expressiveSpring: {
    damping: 18,
    stiffness: 180,
    mass: 0.8,
  } as WithSpringConfig,

  // Smooth gentle slide for carousel and bottom navigation
  gentleSpring: {
    damping: 22,
    stiffness: 140,
    mass: 1.0,
  } as WithSpringConfig,

  // Press feedback scale
  pressScale: 0.97,
} as const;
