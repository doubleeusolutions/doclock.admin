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
  getRecordedClassById,
  getSubjectVideoDetail,
  RecordedClass,
  ClassTimestamp,
} from '@/data/recordedClassesData';
import { ClassDetailHeader } from '@/components/videos/ClassDetailHeader';
import { VideoPlayer } from '@/components/videos/VideoPlayer';
import { Colors, Motion } from '@/theme';

type DetailTabType = 'timestamps' | 'pearls' | 'playlist';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ClassDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { classId } = useLocalSearchParams<{ classId: string }>();

  const classData: RecordedClass = useMemo(() => {
    const found = getRecordedClassById((classId as string) || 'anat-cls-01');
    return (
      found || {
        id: 'anat-cls-01',
        subjectId: 'anatomy',
        classNumber: 1,
        title: 'Brachial Plexus: Roots, Trunks & Clinical Neuropathies',
        chapterTitle: 'Upper Limb Anatomy',
        faculty: {
          name: 'Dr. Sarah Jenkins, MD',
          title: 'Professor of Clinical Anatomy',
          avatar:
            'https://images.unsplash.com/photo-1594824813629-652391b1a030?w=400&auto=format&fit=crop&q=80',
          institution: 'DocLock Medical Faculty',
        },
        duration: '45:10',
        durationSeconds: 2710,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80',
        isHighYield: true,
        progressPercent: 30,
        status: 'in-progress',
        viewsCount: '18.4k views',
        rating: 4.9,
        description: 'Comprehensive high-yield breakdown of the Brachial Plexus.',
        timestamps: [],
        highYieldPearls: [],
        notesPdfSize: '5.2 MB PDF',
        associatedMcqCount: 15,
      }
    );
  }, [classId]);

  const subjectDetail = useMemo(
    () => getSubjectVideoDetail(classData.subjectId),
    [classData.subjectId]
  );

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(120); // starts at 2m in for realistic progress
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [activeTab, setActiveTab] = useState<DetailTabType>('timestamps');
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Timer simulation when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSeconds((prev) => {
        if (prev >= classData.durationSeconds) {
          setIsPlaying(false);
          return classData.durationSeconds;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, classData.durationSeconds]);

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
    Alert.alert(
      'Download Notes',
      `Downloading High-Yield Lecture Slides & Notes (${classData.notesPdfSize}). Available in offline locker.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handlePracticeMCQs = () => {
    Alert.alert(
      'Launch Drill',
      `Ready to practice ${classData.associatedMcqCount} clinical questions on ${classData.chapterTitle}?`,
      [
        { text: 'Start Practice', style: 'default' },
        { text: 'Later', style: 'cancel' },
      ]
    );
  };

  const handleNextClass = (nextClass: RecordedClass) => {
    router.push(`/videos/class/${nextClass.id}` as any);
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <ClassDetailHeader
        classNumber={classData.classNumber}
        totalClasses={subjectDetail.videoCount}
        isBookmarked={isBookmarked}
        onBookmarkPress={handleBookmarkToggle}
        onSharePress={() =>
          Alert.alert('Share Lecture', `Share "${classData.title}" with study group.`)
        }
        onDownloadPress={() =>
          Alert.alert('Offline Video', 'Downloading video for offline viewing in DocLock.')
        }
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
            durationSeconds={classData.durationSeconds}
            currentSeconds={currentSeconds}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
            playbackSpeed={playbackSpeed}
            onChangeSpeed={setPlaybackSpeed}
          />

          {/* Class Title & Meta Block */}
          <View style={styles.titleCard}>
            <View style={styles.metaRow}>
              <View style={styles.chapterPill}>
                <Text style={styles.chapterPillText}>
                  {subjectDetail.name} • {classData.chapterTitle}
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
                {subjectDetail.classes
                  .filter((c) => c.id !== classData.id)
                  .map((otherClass) => (
                    <PlaylistItemRow
                      key={otherClass.id}
                      item={otherClass}
                      onPress={() => handleNextClass(otherClass)}
                    />
                  ))}
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
