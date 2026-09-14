import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Motion } from '@/theme';

export type NavTabId =
  | 'home'
  | 'qbank'
  | 'videos'
  | 'tests'
  | 'profile'
  | 'practice'
  | 'courses';

interface NavDestination {
  id: 'home' | 'qbank' | 'videos' | 'tests' | 'profile';
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const DESTINATIONS: NavDestination[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
  },
  {
    id: 'qbank',
    label: 'Qbank',
    icon: 'inventory-2',
  },
  {
    id: 'videos',
    label: 'Videos',
    icon: 'play-circle',
  },
  {
    id: 'tests',
    label: 'Tests',
    icon: 'assignment',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'person',
  },
];

interface BottomNavigationProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const NavItem: React.FC<{
  destination: NavDestination;
  isActive: boolean;
  onPress: () => void;
}> = ({ destination, isActive, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, Motion.tactileSpring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Motion.tactileSpring);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.itemContainer, animatedStyle]}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={destination.label}
    >
      {/* Pill behind icon */}
      <View
        style={[
          styles.pillIndicator,
          isActive && styles.pillIndicatorActive,
        ]}
      >
        <MaterialIcons
          name={destination.icon}
          size={22}
          color={isActive ? Colors.primary : Colors.textMuted}
        />
      </View>

      {/* Label */}
      <Text
        style={[
          styles.itemLabel,
          isActive ? styles.itemLabelActive : styles.itemLabelInactive,
        ]}
      >
        {destination.label}
      </Text>
    </AnimatedPressable>
  );
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const insets = useSafeAreaInsets();

  // Normalize active tab ID in case legacy routes are passed
  const normalizedActiveTab: string =
    activeTab === 'practice'
      ? 'qbank'
      : activeTab === 'courses'
      ? 'videos'
      : activeTab;

  return (
    <View
      style={[
        styles.barContainer,
        {
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      <View style={styles.barInner}>
        {DESTINATIONS.map((dest) => (
          <NavItem
            key={dest.id}
            destination={dest}
            isActive={normalizedActiveTab === dest.id}
            onPress={() => onSelectTab(dest.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  barInner: {
    height: 64,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  itemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  pillIndicator: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  pillIndicatorActive: {
    backgroundColor: '#d7e2ff',
  },
  itemLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  itemLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  itemLabelInactive: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
