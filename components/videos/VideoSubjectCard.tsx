import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { VideoSubject } from '@/data/videosData';
import { Colors, Motion } from '@/theme';

interface VideoSubjectCardProps {
  subject: VideoSubject;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const VideoSubjectCard: React.FC<VideoSubjectCardProps> = ({
  subject,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.985, Motion.tactileSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Motion.tactileSpring);
      }}
      style={[styles.card, animStyle]}
      accessibilityRole="button"
      accessibilityLabel={`${subject.name}, ${subject.chaptersCount} Chapters, ${subject.durationHours} hours, ${subject.videoCount} Videos`}
    >
      {/* Left Subject Info */}
      <View style={styles.leftGroup}>
        <View style={[styles.iconCircle, { backgroundColor: subject.iconBgColor }]}>
          <MaterialIcons
            name={subject.iconName}
            size={20}
            color={subject.iconColor}
          />
        </View>

        <View style={styles.textGroup}>
          <Text style={styles.subjectTitle} numberOfLines={1}>
            {subject.name}
          </Text>
          <Text style={styles.detailsText}>
            {subject.chaptersCount} Chapters • {subject.durationHours} hrs
          </Text>
        </View>
      </View>

      {/* Right Video Pill Badge & Chevron */}
      <View style={styles.rightGroup}>
        <View style={styles.videoPill}>
          <Text style={styles.videoPillText}>{subject.videoCount} Videos</Text>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={18}
          color={Colors.onSurfaceVariant}
        />
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.25)',
    shadowColor: 'rgba(18, 28, 43, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
  },
  subjectTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 20,
  },
  detailsText: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  videoPill: {
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 9999,
    backgroundColor: '#eaf1ff',
  },
  videoPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0056d6',
  },
});
