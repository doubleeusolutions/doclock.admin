import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Shapes, Spacing, Typography, Motion } from '@/theme';

interface PillProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Pill: React.FC<PillProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  style,
  labelStyle,
  testID,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(Motion.pressScale, Motion.tactileSpring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Motion.tactileSpring);
  };

  return (
    <AnimatedPressable
      testID={testID}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.base,
        selected ? styles.selectedContainer : styles.unselectedContainer,
        animatedStyle,
        style,
      ]}
    >
      {icon ? <>{icon}</> : null}
      <Text
        style={[
          styles.text,
          selected ? styles.selectedText : styles.unselectedText,
          labelStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Shapes.pill,
    marginRight: Spacing.sm,
    gap: 6,
  },
  selectedContainer: {
    backgroundColor: Colors.primaryContainer,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  unselectedContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  text: {
    ...Typography.labelLarge,
  },
  selectedText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  unselectedText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
