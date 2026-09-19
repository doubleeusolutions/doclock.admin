import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  RecordedClass,
  ClassTimestamp,
} from '@/data/recordedClassesData';
import { ClassDetailHeader } from '@/components/videos/ClassDetailHeader';
import { VideoPlayer } from '@/components/videos/VideoPlayer';
import { Colors, Motion } from '@/theme';
import { useVideoLectures } from '@/hooks/useVideoLectures';
import { ActivityIndicator } from 'react-native';

type DetailTabType = 'timestamps' | 'pearls' | 'playlist';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ClassDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const { getClassDetail, getSubjectClasses, savePlaybackProgress } = useVideoLectures();

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<RecordedClass | null>(null);
  const [playlist, setPlaylist] = useState<RecordedClass[]>([]);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [activeTab, setActiveTab] = useState<DetailTabType>('timestamps');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadClass = async () => {
      try {
        setLoading(true);
        const data = await getClassDetail(classId as string);
        if (isMounted) {
          setClassData(data);
          if (data && data.subjectId) {
            const subjectObj = await getSubjectClasses(data.subjectId);
            if (isMounted && subjectObj) {
              setPlaylist(subjectObj.classes);
            }
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadClass();
    return () => {
      isMounted = false;
    };
  }, [classId, getClassDetail, getSubjectClasses]);

  // Playback state is now driven directly by real video player
  useEffect(() => {
    if (classData) {
      savePlaybackProgress(classData.id, currentSeconds, classData.durationSeconds);
    }
  }, [currentSeconds, classData?.id, classData?.durationSeconds, savePlaybackProgress]);

  useEffect(() => {
    if (classData) {
      savePlaybackProgress(classData.id, currentSeconds, classData.durationSeconds);
    }
  }, [currentSeconds, classData?.id, classData?.durationSeconds, savePlaybackProgress]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (seconds: number) => {
    setCurrentSeconds(seconds);
  };

  const handleTimestampClick = (item: ClassTimestamp) => {
    setCurrentSeconds(item.seconds);
    setIsPlaying(true);
  };

  const handleBookmarkToggle = () => {
    if (!classData) return;
    setIsBookmarked((prev) => {
      const next = !prev;
      Alert.alert(
        next ? 'Class Bookmarked' : 'Removed from Bookmarks',
        next
          ? `"${classData.title}" saved to your study locker.`
          : 'Lecture removed from bookmarks.'
      );
      return next;
    });
  };

  const handleDownloadNotes = () => {
    if (!classData) return;
    const sizeText = classData.notesPdfSize ? ` (${classData.notesPdfSize})` : '';
    Alert.alert(
      'Download Notes',
      `Downloading High-Yield Lecture Slides & Notes${sizeText}. Available in offline locker.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handlePracticeMCQs = () => {
    if (!classData) return;
    if (classData.associatedMcqTopicId) {
      router.push(`/qbank/${classData.subjectId}` as any);
    } else {
      Alert.alert(
        'Practice MCQs',
        `Launching high-yield drill for ${classData.chapterTitle}.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Launch QBank',
            onPress: () => router.push(`/qbank/${classData.subjectId}` as any),
          },
        ]
      );
    }
  };

  const handleNextClass = (nextClass: RecordedClass) => {
    router.replace(`/videos/class/${nextClass.id}` as any);
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', gap: 12 }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ fontSize: 14, color: Colors.onSurfaceVariant }}>Loading video lecture from database...</Text>
      </View>
    );
  }

  if (!classData) {
    return (
      <View style={[styles.safeArea, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 }]}>
        <MaterialIcons name="ondemand-video" size={48} color={Colors.primary} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.onSurface }}>Lecture Not Found</Text>
        <Text style={{ fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center' }}>
          This lecture could not be found in the database.
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: 9999 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* 64px Standard Header with Back, Title & Bookmark */}
      <ClassDetailHeader
        classNumber={classData.classNumber}
        totalClasses={playlist.length > 0 ? playlist.length : undefined}
        isBookmarked={isBookmarked}
        onBookmarkPress={handleBookmarkToggle}
        onSharePress={() =>
          Alert.alert('Share Class', `Share "${classData.title}" with medical colleagues.`)
        }
        onDownloadPress={handleDownloadNotes}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerWrapper}>
          {/* Interactive Medical Video Player */}
          <VideoPlayer
            thumbnailUrl={classData.thumbnailUrl}
            videoUrl={classData.videoUrl}
            durationSeconds={classData.durationSeconds}
            currentSeconds={currentSeconds}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
            playbackSpeed={playbackSpeed}
            onChangeSpeed={setPlaybackSpeed}
            onTimeUpdate={setCurrentSeconds}
            onPlayingChange={setIsPlaying}
          />

          {/* Class Title & Meta Block */}
          <View style={styles.titleCard}>
            <View style={styles.metaRow}>
              <View style={styles.chapterPill}>
                <Text style={styles.chapterPillText}>
                  {(classData.subjectId ? classData.subjectId.charAt(0).toUpperCase() + classData.subjectId.slice(1) : 'Subject')} • {classData.chapterTitle}
                </Text>
              </View>

              {classData.isHighYield && (
                <View style={styles.hyBadge}>
                  <MaterialIcons name="stars" size={13} color="#f59e0b" />
                  <Text style={styles.hyBadgeText}>High-Yield</Text>
                </View>
              )}
            </View>

            <Text style={styles.classTitle}>{classData.title}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialIcons name="visibility" size={14} color={Colors.onSurfaceVariant} />
                <Text style={styles.statText}>{classData.viewsCount}</Text>
              </View>
              <Text style={styles.bulletDot}>•</Text>
              <View style={styles.statItem}>
                <MaterialIcons name="star" size={14} color="#f59e0b" />
                <Text style={styles.statText}>{classData.rating.toFixed(1)} / 5.0</Text>
              </View>
              <Text style={styles.bulletDot}>•</Text>
              <View style={styles.statItem}>
                <MaterialIcons name="schedule" size={14} color={Colors.onSurfaceVariant} />
                <Text style={styles.statText}>{classData.duration}</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.descriptionText}>{classData.description}</Text>
          </View>

          {/* Faculty Card */}
          <View style={styles.facultyCard}>
            <Image
              source={{ uri: classData.faculty.avatar }}
              style={styles.facultyAvatar}
              resizeMode="cover"
            />
            <View style={styles.facultyCol}>
              <View style={styles.facultyNameRow}>
                <Text style={styles.facultyName}>{classData.faculty.name}</Text>
                <MaterialIcons name="verified" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.facultyTitle} numberOfLines={1}>
                {classData.faculty.title}
              </Text>
              <Text style={styles.facultyInstitution} numberOfLines={1}>
                {classData.faculty.institution}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                Alert.alert(
                  'Ask Doubt',
                  `Send clinical doubt to ${classData.faculty.name}. Response guaranteed within 2 hours.`
                )
              }
              style={styles.askDoubtBtn}
              accessibilityRole="button"
            >
              <MaterialIcons name="forum" size={14} color={Colors.primary} />
              <Text style={styles.askDoubtText}>Doubt</Text>
            </Pressable>
          </View>

          {/* Action Buttons Strip: Notes & Practice MCQs */}
          <View style={styles.actionStrip}>
            <Pressable
              onPress={handleDownloadNotes}
              style={styles.actionPillBtn}
              accessibilityRole="button"
            >
              <MaterialIcons name="file-download" size={18} color={Colors.primary} />
              <View style={styles.actionBtnTextCol}>
                <Text style={styles.actionBtnMainText}>Lecture Notes</Text>
                <Text style={styles.actionBtnSubText}>{classData.notesPdfSize}</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handlePracticeMCQs}
              style={[styles.actionPillBtn, styles.actionPillBtnPrimary]}
              accessibilityRole="button"
            >
              <MaterialIcons name="quiz" size={18} color="#ffffff" />
              <View style={styles.actionBtnTextCol}>
                <Text style={styles.actionBtnMainTextWhite}>Practice MCQs</Text>
                <Text style={styles.actionBtnSubTextWhite}>
                  {classData.associatedMcqCount} High-Yield Drills
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Detail Tabs Bar */}
          <View style={styles.tabsBar}>
            <Pressable
              onPress={() => setActiveTab('timestamps')}
              style={[
                styles.tabItem,
                activeTab === 'timestamps' ? styles.tabItemActive : styles.tabItemInactive,
              ]}
              accessibilityRole="tab"
            >
              <MaterialIcons
                name="format-list-numbered"
                size={16}
                color={activeTab === 'timestamps' ? '#ffffff' : Colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'timestamps' ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Timestamps ({classData.timestamps.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('pearls')}
              style={[
                styles.tabItem,
                activeTab === 'pearls' ? styles.tabItemActive : styles.tabItemInactive,
              ]}
              accessibilityRole="tab"
            >
              <MaterialIcons
                name="stars"
                size={16}
                color={activeTab === 'pearls' ? '#ffffff' : Colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'pearls' ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Clinical Pearls
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('playlist')}
              style={[
                styles.tabItem,
                activeTab === 'playlist' ? styles.tabItemActive : styles.tabItemInactive,
              ]}
              accessibilityRole="tab"
            >
              <MaterialIcons
                name="playlist-play"
                size={16}
                color={activeTab === 'playlist' ? '#ffffff' : Colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'playlist' ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Up Next
              </Text>
            </Pressable>
          </View>

          {/* Tab 1: Timestamps & Agenda */}
          {activeTab === 'timestamps' && (
            <View style={styles.tabContentContainer}>
              <View style={styles.timestampsCard}>
                {classData.timestamps.length > 0 ? (
                  classData.timestamps.map((t, idx) => {
                    const isActiveTime =
                      currentSeconds >= t.seconds &&
                      (idx === classData.timestamps.length - 1 ||
                        currentSeconds < classData.timestamps[idx + 1].seconds);

                    return (
                      <TimestampRow
                        key={t.time}
                        item={t}
                        isActive={isActiveTime}
                        isLast={idx === classData.timestamps.length - 1}
                        onPress={() => handleTimestampClick(t)}
                      />
                    );
                  })
                ) : (
                  <Text style={styles.emptyTabText}>
                    No timestamps recorded for this lecture.
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Tab 2: High-Yield Clinical Pearls */}
          {activeTab === 'pearls' && (
            <View style={styles.tabContentContainer}>
              <View style={styles.pearlsCard}>
                <View style={styles.pearlsHeader}>
                  <MaterialIcons name="auto-awesome" size={18} color={Colors.primary} />
                  <Text style={styles.pearlsHeaderTitle}>
                    High-Yield Exam Takeaways
                  </Text>
                </View>

                {classData.highYieldPearls.map((pearl, i) => (
                  <View key={i} style={styles.pearlItem}>
                    <View style={styles.pearlBullet}>
                      <Text style={styles.pearlBulletNumber}>{i + 1}</Text>
                    </View>
                    <Text style={styles.pearlText}>{pearl}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tab 3: Next in Playlist */}
          {activeTab === 'playlist' && (
            <View style={styles.tabContentContainer}>
              <View style={styles.playlistContainer}>
                {playlist.filter((c) => c.id !== classData.id).length > 0 ? (
                  playlist
                    .filter((c) => c.id !== classData.id)
                    .map((otherClass) => (
                      <PlaylistItemRow
                        key={otherClass.id}
                        item={otherClass}
                        onPress={() => handleNextClass(otherClass)}
                      />
                    ))
                ) : (
                  <View style={{ padding: 24, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: Colors.onSurfaceVariant }}>
                      No other classes available in this playlist yet.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Bottom spacer for clearance */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </View>
  );
}

const TimestampRow: React.FC<{
  item: ClassTimestamp;
  isActive: boolean;
  isLast: boolean;
  onPress: () => void;
}> = ({ item, isActive, isLast, onPress }) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
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
      style={[
        styles.timestampRow,
        isActive && styles.timestampRowActive,
        isLast && styles.timestampRowLast,
        animStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Seek to ${item.time}, ${item.title}`}
    >
      <View
        style={[
          styles.timePill,
          isActive ? styles.timePillActive : styles.timePillInactive,
        ]}
      >
        <Text
          style={[
            styles.timePillText,
            isActive ? styles.timePillTextActive : styles.timePillTextInactive,
          ]}
        >
          {item.time}
        </Text>
      </View>

      <View style={styles.timestampCol}>
        <Text
          style={[
            styles.timestampTitle,
            isActive && styles.timestampTitleActive,
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
      </View>

      {item.isHighYield && (
        <View style={styles.hySmallTag}>
          <MaterialIcons name="stars" size={12} color="#f59e0b" />
          <Text style={styles.hySmallTagText}>HY</Text>
        </View>
      )}

      <MaterialIcons
        name="play-circle-outline"
        size={18}
        color={isActive ? Colors.primary : Colors.outlineVariant}
      />
    </AnimatedPressable>
  );
};

const PlaylistItemRow: React.FC<{
  item: RecordedClass;
  onPress: () => void;
}> = ({ item, onPress }) => {
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
      style={[styles.playlistCard, animStyle]}
      accessibilityRole="button"
    >
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={styles.playlistThumb}
        resizeMode="cover"
      />
      <View style={styles.playlistCol}>
        <Text style={styles.playlistClassNumber}>Class {item.classNumber}</Text>
        <Text style={styles.playlistTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.playlistMeta}>
          {item.duration} • {item.faculty.name}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={18} color={Colors.outlineVariant} />
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingTop: 12,
  },
  centerWrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },

  /* Title Card */
  titleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    shadowColor: 'rgba(18, 28, 43, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chapterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: Colors.surfaceContainer,
  },
  chapterPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  hyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 9999,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  hyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
  },
  classTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  bulletDot: {
    fontSize: 12,
    color: Colors.outlineVariant,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.onSurfaceVariant,
    paddingTop: 2,
  },

  /* Faculty Card */
  facultyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  facultyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainer,
  },
  facultyCol: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  facultyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  facultyName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  facultyTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
  facultyInstitution: {
    fontSize: 11.5,
    color: Colors.onSurfaceVariant,
  },
  askDoubtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: '#eaf1ff',
  },
  askDoubtText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },

  /* Action Strip */
  actionStrip: {
    flexDirection: 'row',
    gap: 10,
  },
  actionPillBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: 'rgba(18, 28, 43, 0.04)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  actionPillBtnPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnTextCol: {
    flex: 1,
  },
  actionBtnMainText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  actionBtnSubText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  actionBtnMainTextWhite: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  actionBtnSubTextWhite: {
    fontSize: 11,
    color: '#d7e2ff',
    marginTop: 1,
  },

  /* Tabs Bar */
  tabsBar: {
    flexDirection: 'row',
    gap: 8,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 9999,
  },
  tabItemActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabItemInactive: {
    backgroundColor: '#eaf0ff',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  tabTextInactive: {
    color: Colors.onSurfaceVariant,
  },

  /* Tab Content */
  tabContentContainer: {
    gap: 10,
  },
  timestampsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    shadowColor: 'rgba(18, 28, 43, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(194, 198, 213, 0.15)',
  },
  timestampRowActive: {
    backgroundColor: '#f0f4fc',
  },
  timestampRowLast: {
    borderBottomWidth: 0,
  },
  timePill: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  timePillActive: {
    backgroundColor: Colors.primary,
  },
  timePillInactive: {
    backgroundColor: '#eaf0ff',
  },
  timePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timePillTextActive: {
    color: '#ffffff',
  },
  timePillTextInactive: {
    color: Colors.primary,
  },
  timestampCol: {
    flex: 1,
  },
  timestampTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.onSurface,
    lineHeight: 18,
  },
  timestampTitleActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  hySmallTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#fffbeb',
  },
  hySmallTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b45309',
  },
  emptyTabText: {
    padding: 16,
    textAlign: 'center',
    color: Colors.onSurfaceVariant,
  },

  /* Pearls Card */
  pearlsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    gap: 12,
  },
  pearlsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(194, 198, 213, 0.2)',
  },
  pearlsHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  pearlItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pearlBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#eaf0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  pearlBulletNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  pearlText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.onSurface,
  },

  /* Playlist Items */
  playlistContainer: {
    gap: 10,
  },
  playlistCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playlistThumb: {
    width: 80,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#0d1522',
  },
  playlistCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  playlistClassNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  playlistTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
    lineHeight: 17,
  },
  playlistMeta: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },

  bottomSpacer: {
    height: 88,
  },
});
