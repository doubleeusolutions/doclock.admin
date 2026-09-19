import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LiveClassSession } from '@/data/liveClassesData';
import { supabase } from '@/lib/supabase';
import { Colors, Motion } from '@/theme';

interface LiveClassCarouselProps {
  onSelectSession?: (session: LiveClassSession) => void;
  onViewSchedule?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const LiveClassCarousel: React.FC<LiveClassCarouselProps> = ({
  onSelectSession,
  onViewSchedule,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(windowWidth * 0.86, 360);
  const snapInterval = cardWidth + 14;

  const [sessions, setSessions] = useState<LiveClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Reminders tracked by session id
  const [remindedSessionIds, setRemindedSessionIds] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    let isMounted = true;
    const fetchLive = async () => {
      try {
        const { data } = await supabase
          .from('live_sessions')
          .select('*, faculty:faculty_profiles(*)')
          .order('created_at', { ascending: false });

        if (isMounted) {
          if (data && data.length > 0) {
            setSessions(
              data.map((d: any) => ({
                id: d.id,
                title: d.title,
                subject: d.subject_id,
                chapter: d.chapter,
                status: d.status,
                badgeText: d.status === 'live' ? 'LIVE NOW' : 'UPCOMING',
                viewerCount: `${d.attendees_count || 0} Attending`,
                attendeesCount: d.attendees_count || 0,
                faculty: d.faculty
                  ? {
                      name: d.faculty.name,
                      title: d.faculty.title,
                      institution: d.faculty.institution || 'Medical Faculty',
                      avatar: d.faculty.avatar_url,
                    }
                  : {
                      name: 'Medical Faculty',
                      title: 'Faculty Professor',
                      institution: 'DocLock Faculty',
                      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
                    },
                timeString: 'Interactive Q&A Session',
                durationMinutes: d.duration_minutes || 60,
                thumbnailUrl: d.thumbnail_url || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
                gradientOverlay: [
                  'rgba(18, 28, 43, 0.92)',
                  'rgba(0, 47, 108, 0.86)',
                  'rgba(24, 15, 45, 0.90)',
                ],
                accentColor: '#ef4444',
                keyTopics: d.key_topics || [],
              }))
            );
          } else {
            setSessions([]);
          }
        }
      } catch (err) {
        if (isMounted) setSessions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLive();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleReminder = (session: LiveClassSession) => {
    setRemindedSessionIds((prev) => {
      const next = !prev[session.id];
      Alert.alert(
        next ? 'Reminder Activated 🔔' : 'Reminder Removed',
        next
          ? `We'll alert you 10 minutes before "${session.title}" starts.`
          : `Removed reminder for "${session.title}".`
      );
      return {
        ...prev,
        [session.id]: next,
      };
    });
  };

  const handleCardPress = (session: LiveClassSession) => {
    if (session.status === 'live') {
      onSelectSession?.(session);
    } else {
      handleToggleReminder(session);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={[styles.container, styles.emptyBox]}>
        <MaterialIcons name="videocam" size={32} color={Colors.primary} />
        <Text style={styles.emptyTitle}>No Live Sessions Right Now</Text>
        <Text style={styles.emptySubtitle}>Upcoming interactive live classes will appear here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
      >
        {sessions.map((session) => {
          const isLive = session.status === 'live';
          const isReminded = !!remindedSessionIds[session.id];

          return (
            <LiveClassCard
              key={session.id}
              session={session}
              cardWidth={cardWidth}
              isLive={isLive}
              isReminded={isReminded}
              onPress={() => handleCardPress(session)}
              onToggleReminder={() => handleToggleReminder(session)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

interface LiveClassCardProps {
  session: LiveClassSession;
  cardWidth: number;
  isLive: boolean;
  isReminded: boolean;
  onPress: () => void;
  onToggleReminder: () => void;
}

const LiveClassCard: React.FC<LiveClassCardProps> = ({
  session,
  cardWidth,
  isLive,
  isReminded,
  onPress,
  onToggleReminder,
}) => {
  const cardScale = useSharedValue(1);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handleCardPress = () => {
    if (isLive) {
      onPress();
    } else {
      onToggleReminder();
    }
  };

  return (
    <AnimatedPressable
      onPress={handleCardPress}
      onPressIn={() => {
        cardScale.value = withSpring(0.98, Motion.tactileSpring);
      }}
      onPressOut={() => {
        cardScale.value = withSpring(1, Motion.tactileSpring);
      }}
      style={[styles.card, { width: cardWidth }, cardAnimStyle]}
      accessibilityRole="button"
      accessibilityLabel={`${session.badgeText}: ${session.title} by ${session.faculty.name}`}
    >
      {/* Background Photography */}
      <Image
        source={{ uri: session.thumbnailUrl }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Cinematic Glassmorphism Gradient Overlay */}
      <LinearGradient
        colors={session.gradientOverlay}
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
              isLive ? styles.statusBadgeLive : styles.statusBadgeUpcoming,
            ]}
          >
            {isLive ? (
              <View style={styles.badgePulseDot} />
            ) : (
              <MaterialIcons
                name="schedule"
                size={13}
                color={session.status === 'upcoming' ? '#b45309' : '#7c3aed'}
              />
            )}
            <Text
              style={[
                styles.statusBadgeText,
                isLive
                  ? styles.statusBadgeTextLive
                  : session.status === 'upcoming'
                  ? styles.statusBadgeTextUpcoming
                  : styles.statusBadgeTextScheduled,
              ]}
            >
              {session.badgeText}
            </Text>
          </View>

          <View style={styles.viewerPill}>
            <MaterialIcons
              name={isLive ? 'sensors' : 'people'}
              size={13}
              color="#ffffff"
            />
            <Text style={styles.viewerPillText}>{session.viewerCount}</Text>
          </View>
        </View>

        {/* Center: Subject & Title */}
        <View style={styles.centerInfo}>
          <View style={styles.subjectTagRow}>
            <Text style={styles.subjectTagText}>
              {session.subject.toUpperCase()} • {session.chapter.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {session.title}
          </Text>

          <Text style={styles.timeMetaText} numberOfLines={1}>
            {session.timeString}
          </Text>
        </View>

        {/* Footer: Faculty & Action Button */}
        <View style={styles.footerRow}>
          <View style={styles.facultySnippet}>
            <Image
              source={{ uri: session.faculty.avatar }}
              style={styles.facultyAvatar}
            />
            <View style={styles.facultyTextGroup}>
              <Text style={styles.facultyName} numberOfLines={1}>
                {session.faculty.name}
              </Text>
              <Text style={styles.facultyInstitution} numberOfLines={1}>
                {session.faculty.title}
              </Text>
            </View>
          </View>

          {/* Action Button Badge */}
          <View
            style={[
              styles.actionBtn,
              isLive ? styles.actionBtnLive : styles.actionBtnUpcoming,
            ]}
          >
            {isLive ? (
              <>
                <MaterialIcons name="play-arrow" size={16} color="#ffffff" />
                <Text style={styles.actionBtnTextLive}>Join Stream</Text>
              </>
            ) : isReminded ? (
              <>
                <MaterialIcons name="check" size={15} color="#059669" />
                <Text style={styles.actionBtnTextReminded}>Reminded</Text>
              </>
            ) : (
              <>
                <MaterialIcons
                  name="notifications-none"
                  size={15}
                  color={Colors.onSurface}
                />
                <Text style={styles.actionBtnTextUpcoming}>Notify Me</Text>
              </>
            )}
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

  /* Carousel */
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
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusBadgeLive: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
  },
  statusBadgeUpcoming: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  badgePulseDot: {
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
  statusBadgeTextLive: {
    color: '#ffffff',
  },
  statusBadgeTextUpcoming: {
    color: '#b45309',
  },
  statusBadgeTextScheduled: {
    color: '#7c3aed',
  },
  viewerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  viewerPillText: {
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
  timeMetaText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
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
  facultyInstitution: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.75)',
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
  actionBtnUpcoming: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnTextLive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  actionBtnTextUpcoming: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  actionBtnTextReminded: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  centerBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    marginHorizontal: 16,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e7f2',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
