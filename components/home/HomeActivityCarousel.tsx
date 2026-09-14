import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  CarouselActivityItem,
  HOME_CAROUSEL_ACTIVITIES,
} from '@/data/homeCarouselData';
import { Colors, Motion } from '@/theme';

interface HomeActivityCarouselProps {
  onSelectActivity: (item: CarouselActivityItem) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const HomeActivityCarousel: React.FC<HomeActivityCarouselProps> = ({
  onSelectActivity,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(windowWidth * 0.86, 360);
  const snapInterval = cardWidth + 14;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
      >
        {HOME_CAROUSEL_ACTIVITIES.map((activity) => (
          <ActivityCard
            key={activity.id}
            item={activity}
            cardWidth={cardWidth}
            onPress={() => onSelectActivity(activity)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

interface ActivityCardProps {
  item: CarouselActivityItem;
  cardWidth: number;
  onPress: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  item,
  cardWidth,
  onPress,
}) => {
  const cardScale = useSharedValue(1);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const isLive = item.type === 'live';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        cardScale.value = withSpring(0.98, Motion.tactileSpring);
      }}
      onPressOut={() => {
        cardScale.value = withSpring(1, Motion.tactileSpring);
      }}
      style={[styles.card, { width: cardWidth }, cardAnimStyle]}
      accessibilityRole="button"
      accessibilityLabel={`${item.badgeText}: ${item.title}`}
    >
      {/* Background Photography */}
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Cinematic Glassmorphism Gradient Overlay */}
      <LinearGradient
        colors={item.gradientOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Card Foreground Content */}
      <View style={styles.cardContent}>
        {/* Top Badges Strip */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.statusBadge,
              isLive
                ? styles.badgeLive
                : item.type === 'resume_video'
                ? styles.badgeVideo
                : item.type === 'resume_test'
                ? styles.badgeTest
                : styles.badgeQbank,
            ]}
          >
            {isLive ? (
              <View style={styles.badgePulseDot} />
            ) : (
              <MaterialIcons
                name={item.actionIcon}
                size={13}
                color={
                  item.type === 'resume_video'
                    ? '#0059b9'
                    : item.type === 'resume_test'
                    ? '#ba1a1a'
                    : '#0059b9'
                }
              />
            )}
            <Text
              style={[
                styles.statusBadgeText,
                isLive
                  ? styles.badgeTextLive
                  : item.type === 'resume_video'
                  ? styles.badgeTextVideo
                  : item.type === 'resume_test'
                  ? styles.badgeTextTest
                  : styles.badgeTextQbank,
              ]}
            >
              {item.badgeText}
            </Text>
          </View>

          {/* Metric / Meta Pill */}
          <View style={styles.metaPill}>
            <Text style={styles.metaPillText} numberOfLines={1}>
              {item.metaText}
            </Text>
          </View>
        </View>

        {/* Center: Subject, Category & Title */}
        <View style={styles.centerInfo}>
          <View style={styles.subjectTagRow}>
            <Text style={styles.subjectTagText}>
              {item.subject.toUpperCase()} • {item.category.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Progress Bar for Resume Video / Test / QBank */}
          {typeof item.progressPercent === 'number' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${item.progressPercent}%`,
                      backgroundColor: item.accentColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressPercentText}>
                {item.progressPercent}%
              </Text>
            </View>
          )}
        </View>

        {/* Footer: Faculty or Subtitle + Action Button Badge */}
        <View style={styles.footerRow}>
          {item.faculty ? (
            <View style={styles.facultySnippet}>
              <Image
                source={{ uri: item.faculty.avatar }}
                style={styles.facultyAvatar}
              />
              <View style={styles.facultyTextGroup}>
                <Text style={styles.facultyName} numberOfLines={1}>
                  {item.faculty.name}
                </Text>
                <Text style={styles.facultyTitle} numberOfLines={1}>
                  {item.faculty.title}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.categorySnippet}>
              <MaterialIcons
                name={item.actionIcon}
                size={16}
                color="rgba(255, 255, 255, 0.85)"
              />
              <Text style={styles.categorySnippetText} numberOfLines={1}>
                {item.subject}
              </Text>
            </View>
          )}

          {/* Action Button Badge */}
          <View
            style={[
              styles.actionBtn,
              isLive
                ? styles.actionBtnLive
                : item.type === 'resume_video'
                ? styles.actionBtnVideo
                : item.type === 'resume_test'
                ? styles.actionBtnTest
                : styles.actionBtnQbank,
            ]}
          >
            <MaterialIcons
              name={item.actionIcon}
              size={15}
              color={isLive || item.type === 'resume_test' ? '#ffffff' : '#ffffff'}
            />
            <Text style={styles.actionBtnText}>
              {item.actionLabel}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },

  /* Card */
  card: {
    height: 226,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#121c2b',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    zIndex: 2,
  },

  /* Top Row */
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeLive: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
  },
  badgeVideo: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  badgeTest: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  badgeQbank: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  badgePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  badgeTextLive: {
    color: '#ffffff',
  },
  badgeTextVideo: {
    color: '#0059b9',
  },
  badgeTextTest: {
    color: '#ba1a1a',
  },
  badgeTextQbank: {
    color: '#0059b9',
  },

  metaPill: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    maxWidth: '45%',
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },

  /* Center Info */
  centerInfo: {
    gap: 5,
  },
  subjectTagRow: {
    alignSelf: 'flex-start',
  },
  subjectTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#93c5fd',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
    lineHeight: 22,
  },

  /* Progress Bar */
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  progressBarBg: {
    flex: 1,
    height: 5,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 9999,
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* Footer */
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  facultySnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  facultyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  facultyTextGroup: {
    flex: 1,
  },
  facultyName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  facultyTitle: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.75)',
  },

  categorySnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  categorySnippetText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },

  /* Action Buttons */
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  actionBtnLive: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  actionBtnVideo: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  actionBtnTest: {
    backgroundColor: '#ba1a1a',
    shadowColor: '#ba1a1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  actionBtnQbank: {
    backgroundColor: '#0059b9',
    shadowColor: '#0059b9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
