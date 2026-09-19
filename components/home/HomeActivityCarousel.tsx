import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { CarouselActivityItem } from '@/data/homeCarouselData';
import { Colors, Motion } from '@/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface HomeActivityCarouselProps {
  onSelectActivity: (item: CarouselActivityItem) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const HomeActivityCarousel: React.FC<HomeActivityCarouselProps> = ({
  onSelectActivity,
}) => {
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(windowWidth * 0.86, 360);
  const snapInterval = cardWidth + 14;

  const [activities, setActivities] = useState<CarouselActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchActivities = async () => {
      try {
        setLoading(true);
        const dynamicItems: CarouselActivityItem[] = [];

        // 1. Fetch live or upcoming session from database
        const { data: liveData } = await supabase
          .from('live_sessions')
          .select('*, faculty:faculty_profiles(*)')
          .in('status', ['live', 'upcoming'])
          .order('start_time', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (liveData) {
          dynamicItems.push({
            id: liveData.id,
            type: 'live',
            title: liveData.title,
            subject: liveData.subject_id.charAt(0).toUpperCase() + liveData.subject_id.slice(1),
            category: liveData.chapter || 'Live Classroom',
            badgeText: liveData.status === 'live' ? 'LIVE NOW' : 'UPCOMING LIVE',
            badgeType: 'live',
            metaText: `${liveData.attendees_count || 0} Attending`,
            actionLabel: liveData.status === 'live' ? 'Join Stream' : 'View Session',
            actionIcon: 'play-arrow',
            thumbnailUrl:
              liveData.thumbnail_url ||
              'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
            gradientOverlay: [
              'rgba(18, 28, 43, 0.92)',
              'rgba(0, 47, 108, 0.86)',
              'rgba(24, 15, 45, 0.92)',
            ],
            accentColor: '#ef4444',
            faculty: liveData.faculty
              ? {
                  name: liveData.faculty.name,
                  title: liveData.faculty.title,
                  avatar: liveData.faculty.avatar_url,
                }
              : undefined,
            liveSessionData: {
              id: liveData.id,
              title: liveData.title,
              subject: liveData.subject_id,
              chapter: liveData.chapter,
              status: liveData.status,
              stream_url: liveData.stream_url,
              badgeText: liveData.status === 'live' ? 'LIVE NOW' : 'UPCOMING',
              viewerCount: `${liveData.attendees_count || 0} Attending`,
              attendeesCount: liveData.attendees_count || 0,
              timeString: 'Live Classroom',
              durationMinutes: liveData.duration_minutes || 60,
              thumbnailUrl: liveData.thumbnail_url,
              gradientOverlay: [
                'rgba(18, 28, 43, 0.92)',
                'rgba(0, 47, 108, 0.86)',
                'rgba(24, 15, 45, 0.92)',
              ],
              accentColor: '#ef4444',
              keyTopics: liveData.key_topics || [],
              faculty: liveData.faculty
                ? {
                    name: liveData.faculty.name,
                    title: liveData.faculty.title,
                    institution: liveData.faculty.institution || 'Medical Faculty',
                    avatar: liveData.faculty.avatar_url,
                  }
                : {
                    name: 'Medical Faculty',
                    title: 'Professor',
                    institution: 'DocLock Academic Council',
                    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
                  },
            },
          });
        }

        // 2. Fetch last watched video progress if user is signed in
        if (user) {
          const { data: progressData } = await supabase
            .from('user_video_progress')
            .select('*, video:video_classes(*, faculty:faculty_profiles(*))')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (progressData && progressData.video) {
            const vid = progressData.video;
            dynamicItems.push({
              id: `resume-vid-${vid.id}`,
              type: 'resume_video',
              title: vid.title,
              subject: vid.subject_id?.charAt(0).toUpperCase() + vid.subject_id?.slice(1),
              category: vid.chapter_title || 'Video Class',
              badgeText: 'RESUME LECTURE',
              badgeType: 'video',
              metaText: `${progressData.progress_percent || 0}% Watched`,
              progressPercent: progressData.progress_percent || 0,
              actionLabel: 'Resume Video',
              actionIcon: 'play-circle-outline',
              thumbnailUrl:
                vid.thumbnail_url ||
                'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800',
              gradientOverlay: [
                'rgba(0, 47, 108, 0.92)',
                'rgba(0, 89, 185, 0.85)',
                'rgba(0, 103, 128, 0.90)',
              ],
              accentColor: '#68d7fd',
              targetRoute: `/videos/class/${vid.id}`,
              faculty: vid.faculty
                ? {
                    name: vid.faculty.name,
                    title: vid.faculty.title,
                    avatar: vid.faculty.avatar_url,
                  }
                : undefined,
            });
          }
        }

        // 3. Fallback welcome card if database has no live sessions or activity yet
        if (dynamicItems.length === 0) {
          dynamicItems.push({
            id: 'starter-qbank',
            type: 'resume_qbank',
            title: 'Medical Question Bank',
            subject: 'All Subjects',
            category: 'Clinical Vignettes & High-Yield MCQs',
            badgeText: 'START STUDYING',
            badgeType: 'qbank',
            metaText: 'Browse 19 Medical Subjects in Database',
            actionLabel: 'Explore QBank',
            actionIcon: 'assignment',
            thumbnailUrl:
              'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
            gradientOverlay: [
              'rgba(18, 28, 43, 0.92)',
              'rgba(0, 89, 185, 0.85)',
              'rgba(10, 40, 90, 0.90)',
            ],
            accentColor: '#4f8ff7',
            targetRoute: '/(tabs)/qbank',
          });
        }

        if (isMounted) {
          setActivities(dynamicItems);
        }
      } catch (err: any) {
        console.warn('[HomeActivityCarousel] fetchActivities error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

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
        {activities.map((activity) => (
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
            {isLive && <View style={styles.pulseDot} />}
            <Text
              style={[
                styles.statusBadgeText,
                isLive ? styles.badgeTextLive : styles.badgeTextNeutral,
              ]}
            >
              {item.badgeText}
            </Text>
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.subject}</Text>
          </View>
        </View>

        {/* Center: Title & Meta Info */}
        <View style={styles.centerInfo}>
          <Text style={styles.categorySubText}>{item.category}</Text>
          <Text style={styles.titleText} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Optional Progress Bar for resume cards */}
          {item.progressPercent !== undefined && item.progressPercent > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
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
            </View>
          )}

          {/* Meta text (attendees, duration, etc.) */}
          <View style={styles.metaRow}>
            <MaterialIcons
              name={
                isLive
                  ? 'groups'
                  : item.type === 'resume_video'
                  ? 'schedule'
                  : 'check-circle'
              }
              size={14}
              color="rgba(255, 255, 255, 0.75)"
            />
            <Text style={styles.metaText}>{item.metaText}</Text>
          </View>
        </View>

        {/* Bottom Strip: Faculty Avatar or Action Button */}
        <View style={styles.bottomRow}>
          {item.faculty ? (
            <View style={styles.facultyRow}>
              <Image
                source={{ uri: item.faculty.avatar }}
                style={styles.facultyAvatar}
              />
              <View style={styles.facultyTextCol}>
                <Text style={styles.facultyName} numberOfLines={1}>
                  {item.faculty.name}
                </Text>
                <Text style={styles.facultyTitle} numberOfLines={1}>
                  {item.faculty.title}
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <View
            style={[
              styles.actionPill,
              { backgroundColor: isLive ? '#ef4444' : 'rgba(255, 255, 255, 0.22)' },
            ]}
          >
            <Text style={styles.actionPillText}>{item.actionLabel}</Text>
            <MaterialIcons name={item.actionIcon} size={16} color="#ffffff" />
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  card: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    gap: 6,
  },
  badgeLive: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
  },
  badgeVideo: {
    backgroundColor: 'rgba(104, 215, 253, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(104, 215, 253, 0.6)',
  },
  badgeTest: {
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.6)',
  },
  badgeQbank: {
    backgroundColor: 'rgba(79, 143, 247, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(79, 143, 247, 0.6)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  badgeTextLive: {
    color: '#ffffff',
  },
  badgeTextNeutral: {
    color: '#ffffff',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  centerInfo: {
    gap: 4,
  },
  categorySubText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  progressContainer: {
    marginVertical: 4,
  },
  progressBarBackground: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  facultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  facultyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  facultyTextCol: {
    flex: 1,
  },
  facultyName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  facultyTitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 4,
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
