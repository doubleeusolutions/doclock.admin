import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Motion } from '@/theme';

interface SplashVideoScreenProps {
  onFinish: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const videoSource = require('@/assets/splashscreen.mp4');
const APP_LOGO = require('@/assets/logo.png');

export const SplashVideoScreen: React.FC<SplashVideoScreenProps> = ({
  onFinish,
}) => {
  const insets = useSafeAreaInsets();
  const [hasEnded, setHasEnded] = useState(false);

  // Fade out opacity
  const containerOpacity = useSharedValue(1);
  const skipBtnScale = useSharedValue(1);

  const containerAnimStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const skipBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: skipBtnScale.value }],
  }));

  const handleComplete = () => {
    if (hasEnded) return;
    setHasEnded(true);

    containerOpacity.value = withTiming(0, { duration: 400 }, () => {
      runOnJS(onFinish)();
    });
  };

  const player = useVideoPlayer(videoSource, (p) => {
    p.muted = true;
    p.volume = 0;
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      handleComplete();
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  // Fallback timer: guarantees app enters after 5.5 seconds even if video stalls or finishes early
  useEffect(() => {
    const timer = setTimeout(() => {
      handleComplete();
    }, 5500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, containerAnimStyle]}>
      {/* Background Splash Video - No Sound (Muted) */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Top Floating Skip Button */}
      <View style={[styles.topControls, { paddingTop: Math.max(16, insets.top + 8) }]}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Image
              source={APP_LOGO}
              style={styles.brandBadgeLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandBadgeText}>DOCLOCK</Text>
          </View>
        </View>

        <AnimatedPressable
          onPress={handleComplete}
          onPressIn={() => {
            skipBtnScale.value = withSpring(0.92, Motion.tactileSpring);
          }}
          onPressOut={() => {
            skipBtnScale.value = withSpring(1, Motion.tactileSpring);
          }}
          style={[styles.skipButton, skipBtnAnimStyle]}
          accessibilityRole="button"
          accessibilityLabel="Skip intro video"
        >
          <Text style={styles.skipButtonText}>Skip</Text>
          <MaterialIcons name="arrow-forward" size={15} color="#ffffff" />
        </AnimatedPressable>
      </View>

      {/* Bottom Branding Strip */}
      <View
        style={[
          styles.bottomBrandContainer,
          { paddingBottom: Math.max(24, insets.bottom + 16) },
        ]}
      >
        <Text style={styles.copyrightText}>
          DocLock Medical Academy • Initializing Revision
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 99999,
    justifyContent: 'space-between',
  },

  /* Top Controls */
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  brandBadgeLogo: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  brandBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#68d7fd',
    letterSpacing: 0.8,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  skipButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* Bottom Branding */
  bottomBrandContainer: {
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
    paddingHorizontal: 20,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  bottomMottoText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  copyrightText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 0.2,
  },
});
