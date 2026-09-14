import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { RecordedClass } from '@/data/recordedClassesData';
import { Colors, Motion } from '@/theme';

interface RecordedClassCardProps {
  item: RecordedClass;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const RecordedClassCard: React.FC<RecordedClassCardProps> = ({
  item,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isCompleted = item.status === 'completed';
  const isInProgress = item.status === 'in-progress';

  return (
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
      accessibilityLabel={`Class ${item.classNumber}: ${item.title}, Duration ${item.duration}`}
    >
      {/* Video Thumbnail Viewport */}
      <View style={styles.thumbnailWrapper}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />

        <LinearGradient
          colors={['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.55)']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top Badges */}
        <View style={styles.thumbnailTopRow}>
          <View style={styles.classNumberBadge}>
            <Text style={styles.classNumberText}>Class {item.classNumber}</Text>
          </View>

          {item.isHighYield && (
            <View style={styles.highYieldBadge}>
              <MaterialIcons name="stars" size={13} color="#fcd34d" />
              <Text style={styles.highYieldBadgeText}>High-Yield</Text>
            </View>
          )}
        </View>

        {/* Center Play Circle */}
        <View style={styles.centerPlayCircle}>
          <MaterialIcons name="play-arrow" size={24} color={Colors.primary} />
        </View>

        {/* Bottom Duration & Rating Pill */}
        <View style={styles.thumbnailBottomRow}>
          <View style={styles.viewsBadge}>
            <MaterialIcons name="visibility" size={12} color="#ffffff" />
            <Text style={styles.viewsBadgeText}>{item.viewsCount}</Text>
          </View>

          <View style={styles.durationBadge}>
            <MaterialIcons name="schedule" size={12} color="#ffffff" />
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar (if watched or in-progress) */}
      {item.progressPercent > 0 && (
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${item.progressPercent}%`,
                backgroundColor: isCompleted ? '#10b981' : Colors.primary,
              },
            ]}
          />
        </View>
      )}

      {/* Card Content Information */}
      <View style={styles.contentGroup}>
        {/* Chapter & Status Row */}
        <View style={styles.metaRow}>
          <Text style={styles.chapterTag} numberOfLines={1}>
            {item.chapterTitle}
          </Text>

          {isCompleted && (
            <View style={styles.statusPillCompleted}>
              <MaterialIcons name="check-circle" size={12} color="#059669" />
              <Text style={styles.statusTextCompleted}>Completed</Text>
            </View>
          )}

          {isInProgress && (
            <View style={styles.statusPillInProgress}>
              <Text style={styles.statusTextInProgress}>
                {item.progressPercent}% Watched
              </Text>
            </View>
          )}
        </View>

        {/* Class Title */}
        <Text style={styles.classTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Faculty Row */}
        <View style={styles.facultyRow}>
          <Image
            source={{ uri: item.faculty.avatar }}
            style={styles.facultyAvatar}
            resizeMode="cover"
          />
          <Text style={styles.facultyName} numberOfLines={1}>
            {item.faculty.name}
          </Text>
          <Text style={styles.bulletDot}>•</Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={13} color="#f59e0b" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Supporting Pills Row: Notes & Practice MCQs */}
        <View style={styles.footerPillsRow}>
          <View style={styles.resourcePill}>
            <MaterialIcons name="description" size={13} color={Colors.primary} />
            <Text style={styles.resourcePillText}>{item.notesPdfSize}</Text>
          </View>

          <View style={styles.resourcePill}>
            <MaterialIcons name="quiz" size={13} color="#4f46e5" />
            <Text style={[styles.resourcePillText, { color: '#4f46e5' }]}>
              {item.associatedMcqCount} Practice MCQs
            </Text>
          </View>

          <View style={styles.watchNowAction}>
            <Text style={styles.watchNowText}>Watch</Text>
            <MaterialIcons name="arrow-forward" size={14} color={Colors.primary} />
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    shadowColor: 'rgba(18, 28, 43, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  thumbnailWrapper: {
    width: '100%',
    height: 160,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0d1522',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailTopRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  classNumberBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  classNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  highYieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.35)',
  },
  highYieldBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fef08a',
  },
  centerPlayCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -22,
    marginLeft: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailBottomRow: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  viewsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  viewsBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#ffffff',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f0f4fc',
    overflow: 'hidden',
    marginTop: -4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  contentGroup: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chapterTag: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flex: 1,
  },
  statusPillCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 9999,
    backgroundColor: '#ecfdf5',
  },
  statusTextCompleted: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  statusPillInProgress: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 9999,
    backgroundColor: '#eff6ff',
  },
  statusTextInProgress: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  facultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  facultyAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surfaceContainer,
  },
  facultyName: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    flexShrink: 1,
  },
  bulletDot: {
    fontSize: 12,
    color: Colors.outlineVariant,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  footerPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(194, 198, 213, 0.2)',
  },
  resourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0f4fc',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resourcePillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.primary,
  },
  watchNowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  watchNowText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
