import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Motion } from '@/theme';

interface ProfileMenuItemProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchToggle?: (val: boolean) => void;
  onPress?: () => void;
  isLast?: boolean;
  isDanger?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  iconName,
  iconBgColor = '#f0f3ff',
  iconColor = Colors.primary,
  title,
  subtitle,
  badgeText,
  badgeBgColor = '#dfe8fe',
  badgeTextColor = Colors.primary,
  hasSwitch,
  switchValue,
  onSwitchToggle,
  onPress,
  isLast = false,
  isDanger = false,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (hasSwitch && onSwitchToggle) {
      onSwitchToggle(!switchValue);
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.98, Motion.tactileSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Motion.tactileSpring);
      }}
      style={[styles.container, isLast && styles.noBorder, animStyle]}
      accessibilityRole={hasSwitch ? 'switch' : 'button'}
      accessibilityLabel={title}
    >
      {/* Left Icon */}
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: isDanger ? '#ffdad6' : iconBgColor,
          },
        ]}
      >
        <MaterialIcons
          name={iconName}
          size={20}
          color={isDanger ? '#ba1a1a' : iconColor}
        />
      </View>

      {/* Middle Text Info */}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            isDanger && styles.dangerTitle,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Right Accessory */}
      <View style={styles.rightContainer}>
        {badgeText ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: badgeBgColor },
            ]}
          >
            <Text style={[styles.badgeText, { color: badgeTextColor }]}>
              {badgeText}
            </Text>
          </View>
        ) : null}

        {hasSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchToggle}
            trackColor={{ false: '#d9e3f8', true: Colors.primary }}
            thumbColor="#ffffff"
          />
        ) : (
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={isDanger ? '#ba1a1a' : Colors.onSurfaceVariant}
          />
        )}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 238, 255, 0.7)',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  dangerTitle: {
    color: '#ba1a1a',
  },
  subtitle: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
