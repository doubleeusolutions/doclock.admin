import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { AssessmentItem } from '@/data/testsData';
import { Colors, Motion } from '@/theme';

interface AssessmentCardProps {
  assessment: AssessmentItem;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, Motion.tactileSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Motion.tactileSpring);
      }}
      style={[styles.card, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={`${assessment.title}, ${assessment.testsCount} tests`}
    >
      {/* Left Icon Container */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: assessment.iconBgColor },
        ]}
      >
        <MaterialIcons
          name={assessment.iconName}
          size={24}
          color={assessment.iconColor}
        />
      </View>

      {/* Center Details */}
      <View style={styles.centerInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {assessment.title}
          </Text>
          {assessment.tag ? (
            <View
              style={[
                styles.tagBadge,
                { backgroundColor: assessment.tagBgColor },
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: assessment.tagTextColor },
                ]}
                numberOfLines={1}
              >
                {assessment.tag}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.metaSubtitle} numberOfLines={1}>
          {assessment.testsCount} {assessment.testsCount === 1 ? 'Test' : 'Tests'} •{' '}
          {assessment.mcqsCount} MCQs • {assessment.durationHours}h Total
        </Text>
      </View>

      {/* Right Pill & Chevron */}
      <View style={styles.rightGroup}>
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>
            {assessment.testsCount} {assessment.testsCount === 1 ? 'Test' : 'Tests'}
          </Text>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={Colors.onSurfaceVariant}
        />
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(231, 238, 255, 0.6)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  centerInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onSurface,
    flexShrink: 1,
  },
  tagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9999,
    flexShrink: 0,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  metaSubtitle: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  countPill: {
    backgroundColor: '#dfe8fe',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#121c2b',
  },
});
