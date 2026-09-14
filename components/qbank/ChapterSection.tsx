import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Chapter, SubheadingTopic } from '@/data/chaptersData';
import { Colors, Motion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SubheadingItemProps {
  topic: SubheadingTopic;
  onPress?: (topic: SubheadingTopic) => void;
  isLast?: boolean;
}

export const SubheadingItem: React.FC<SubheadingItemProps> = ({
  topic,
  onPress,
  isLast = false,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isCompleted = topic.status === 'completed';
  const isInProgress = topic.status === 'in-progress';

  return (
    <AnimatedPressable
      onPress={() => onPress?.(topic)}
      onPressIn={() => {
        scale.value = withSpring(0.98, Motion.tactileSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Motion.tactileSpring);
      }}
      style={[
        styles.topicItem,
        isLast && styles.topicItemLast,
        animStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${topic.title}, ${topic.mcqCount} questions`}
    >
      {/* Left Status Icon */}
      <View
        style={[
          styles.statusIconBox,
          isCompleted
            ? styles.statusCompleted
            : isInProgress
            ? styles.statusProgress
            : styles.statusUnattempted,
        ]}
      >
        <MaterialIcons
          name={
            isCompleted
              ? 'check'
              : isInProgress
              ? 'hourglass-bottom'
              : 'radio-button-unchecked'
          }
          size={14}
          color={
            isCompleted
              ? '#065f46'
              : isInProgress
              ? Colors.primary
              : Colors.onSurfaceVariant
          }
        />
      </View>

      {/* Middle Content */}
      <View style={styles.topicMiddle}>
        <View style={styles.titleRow}>
          <Text style={styles.topicTitle} numberOfLines={2}>
            {topic.title}
          </Text>
        </View>

        {/* Badges & Metrics Row */}
        <View style={styles.badgeRow}>
          {topic.isHighYield && (
            <View style={styles.highYieldBadge}>
              <Text style={styles.highYieldBadgeText}>High Yield</Text>
            </View>
          )}

          {topic.isImageBased && (
            <View style={styles.imageBadge}>
              <MaterialIcons name="image" size={10} color="#006780" />
              <Text style={styles.imageBadgeText}>Image-Based</Text>
            </View>
          )}

          <Text style={styles.metaText}>
            {topic.completedMcqs > 0
              ? `${topic.completedMcqs}/${topic.mcqCount} MCQs`
              : `${topic.mcqCount} MCQs`}{' '}
            • {topic.durationMinutes} min
          </Text>
        </View>
      </View>

      {/* Right Action CTA Button */}
      <View style={styles.rightAction}>
        <View
          style={[
            styles.actionPill,
            isCompleted
              ? styles.actionPillReview
              : isInProgress
              ? styles.actionPillResume
              : styles.actionPillStart,
          ]}
        >
          <Text
            style={[
              styles.actionPillText,
              isCompleted
                ? styles.actionPillTextReview
                : isInProgress
                ? styles.actionPillTextResume
                : styles.actionPillTextStart,
            ]}
          >
            {isCompleted ? 'Review' : isInProgress ? 'Resume' : 'Start'}
          </Text>
          <MaterialIcons
            name={
              isCompleted
                ? 'arrow-forward'
                : isInProgress
                ? 'play-arrow'
                : 'arrow-forward'
            }
            size={13}
            color={
              isCompleted
                ? '#065f46'
                : isInProgress
                ? '#ffffff'
                : Colors.primary
            }
          />
        </View>
      </View>
    </AnimatedPressable>
  );
};

interface ChapterSectionProps {
  chapter: Chapter;
  onSelectTopic?: (topic: SubheadingTopic) => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  defaultExpanded?: boolean;
}

export const ChapterSection: React.FC<ChapterSectionProps> = ({
  chapter,
  onSelectTopic,
  isExpanded: controlledExpanded,
  onToggleExpanded,
  defaultExpanded = true,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded =
    controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (onToggleExpanded) {
      onToggleExpanded();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const totalMcqs = chapter.topics.reduce((sum, t) => sum + t.mcqCount, 0);
  const completedCount = chapter.topics.filter(
    (t) => t.status === 'completed'
  ).length;

  return (
    <View style={styles.chapterCard}>
      {/* Chapter Heading Header Bar */}
      <Pressable
        onPress={handleToggle}
        style={styles.chapterHeader}
        accessibilityRole="button"
        accessibilityLabel={`Chapter ${chapter.chapterNumber}: ${chapter.title}`}
      >
        <View style={styles.chapterHeaderLeft}>
          <View style={styles.chapterNumberBadge}>
            <Text style={styles.chapterNumberText}>
              Ch {chapter.chapterNumber.toString().padStart(2, '0')}
            </Text>
          </View>
          <View style={styles.chapterTitles}>
            <Text style={styles.chapterTitleText} numberOfLines={1}>
              {chapter.title}
            </Text>
            <Text style={styles.chapterSubText}>
              {chapter.topics.length}{' '}
              {chapter.topics.length === 1 ? 'Topic' : 'Topics'} • {totalMcqs} MCQs
              {completedCount > 0 && ` • ${completedCount}/${chapter.topics.length} done`}
            </Text>
          </View>
        </View>

        <View style={styles.chapterHeaderRight}>
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={22}
            color={Colors.onSurfaceVariant}
          />
        </View>
      </Pressable>

      {/* Subheadings Topics List */}
      {isExpanded && (
        <View style={styles.topicsContainer}>
          {chapter.topics.map((topic, index) => (
            <SubheadingItem
              key={topic.id}
              topic={topic}
              isLast={index === chapter.topics.length - 1}
              onPress={onSelectTopic}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chapterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(231, 238, 255, 0.8)',
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  chapterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  chapterNumberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#d7e2ff',
    flexShrink: 0,
  },
  chapterNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#004591',
    letterSpacing: 0.3,
  },
  chapterTitles: {
    flex: 1,
    minWidth: 0,
  },
  chapterTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  chapterSubText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  chapterHeaderRight: {
    flexShrink: 0,
  },
  topicsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(231, 238, 255, 0.7)',
    backgroundColor: '#fafbff',
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 238, 255, 0.6)',
    backgroundColor: '#ffffff',
  },
  topicItemLast: {
    borderBottomWidth: 0,
  },
  statusIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 10,
  },
  statusCompleted: {
    backgroundColor: '#d1fae5',
  },
  statusProgress: {
    backgroundColor: '#d7e2ff',
  },
  statusUnattempted: {
    backgroundColor: '#f0f3ff',
  },
  topicMiddle: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  titleRow: {
    marginBottom: 3,
  },
  topicTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.onSurface,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  highYieldBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 9999,
    backgroundColor: '#e5deff',
  },
  highYieldBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#5b4aba',
  },
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 9999,
    backgroundColor: '#b9eaff',
  },
  imageBadgeText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#006780',
  },
  metaText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  rightAction: {
    flexShrink: 0,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  actionPillStart: {
    backgroundColor: '#f0f4fc',
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.4)',
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionPillTextStart: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionPillResume: {
    backgroundColor: Colors.primary,
  },
  actionPillTextResume: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  actionPillReview: {
    backgroundColor: '#d1fae5',
  },
  actionPillTextReview: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065f46',
  },
});
