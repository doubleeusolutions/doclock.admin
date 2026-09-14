import { useWindowDimensions } from 'react-native';

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  // Horizontal scale factor
  const scale = width / BASE_WIDTH;

  // Normalized scaling clamped to prevent extreme distortion on large tablets or foldables
  const normalize = (size: number, factor: number = 0.5): number => {
    return Math.round(size + (scale * size - size) * factor);
  };

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  // Compute card width for 1.1 carousel layout:
  // Carousel width shows exactly 1 card + 0.1 of next card
  // With horizontal screen padding (20px * 2) and card spacing (12px)
  const carouselCardWidth = Math.round(width * 0.85);

  return {
    width,
    height,
    scale,
    normalize,
    isSmallDevice,
    isTablet,
    carouselCardWidth,
  };
}
