import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Motion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DesktopSyncBannerProps {
  onPress?: () => void;
}

export const DesktopSyncBanner: React.FC<DesktopSyncBannerProps> = ({ onPress }) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.98, Motion.tactileSpring);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, Motion.tactileSpring);
        }}
        style={[styles.card, animStyle]}
        accessibilityRole="button"
        accessibilityLabel="Continue on Web, Desktop Sync"
      >
        <View style={styles.textColumn}>
          {/* Badge */}
          <View style={styles.badgeRow}>
            <MaterialIcons name="devices" size={16} color={Colors.primary} />
            <Text style={styles.badgeText}>Desktop Sync</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Continue on Web</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Scan QR code to sync your revision progress instantly.
          </Text>
        </View>

        {/* QR Code Container */}
        <View style={styles.qrContainer}>
          <MaterialIcons name="qr-code-2" size={38} color={Colors.onSurface} />
        </View>
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  qrContainer: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#f0f4fc',
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
});
