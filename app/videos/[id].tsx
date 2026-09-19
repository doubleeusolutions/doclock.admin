import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  RecordedClass,
  SubjectVideoDetail,
} from '@/data/recordedClassesData';
import { VideoSubjectDetailHeader } from '@/components/videos/VideoSubjectDetailHeader';
import { RecordedClassCard } from '@/components/videos/RecordedClassCard';
import { Colors, Motion } from '@/theme';
import { useVideoLectures } from '@/hooks/useVideoLectures';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SubjectClassesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const subjectId = (id as string) || 'anatomy';
  const { getSubjectClasses } = useVideoLectures();

  const [loading, setLoading] = useState(true);
  const [subjectDetail, setSubjectDetail] = useState<SubjectVideoDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Track expanded state for chapters (default: all collapsed)
  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >({});

  const collapseBtnScale = useSharedValue(1);
  const collapseBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: collapseBtnScale.value }],
  }));

  useEffect(() => {
    let isMounted = true;
    const loadClasses = async () => {
      try {
        setLoading(true);
        const data = await getSubjectClasses(subjectId);
        if (isMounted) {
          setSubjectDetail(data);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadClasses();
    return () => {
      isMounted = false;
    };
  }, [subjectId, getSubjectClasses]);

  // Extract distinct chapter titles for horizontal filter tabs
  const distinctChapters = useMemo(() => {
    if (!subjectDetail) return [];
    const titles: string[] = [];
    subjectDetail.classes.forEach((c) => {
      if (!titles.includes(c.chapterTitle)) {
        titles.push(c.chapterTitle);
      }
    });
    return titles;
  }, [subjectDetail]);

  // Filter classes by category or specific chapter and search term
  const filteredClasses = useMemo(() => {
    if (!subjectDetail) return [];
    const q = searchQuery.trim().toLowerCase();

    return subjectDetail.classes.filter((cls) => {
      // Filter tab logic
      let matchesFilter = true;
      if (selectedFilter === 'all') {
        matchesFilter = true;
      } else if (selectedFilter === 'high-yield') {
        matchesFilter = cls.isHighYield;
      } else if (selectedFilter === 'in-progress') {
        matchesFilter = cls.status === 'in-progress';
      } else if (selectedFilter === 'completed') {
        matchesFilter = cls.status === 'completed';
      } else {
        // Specific chapter filter
        matchesFilter = cls.chapterTitle === selectedFilter;
      }

      // Search query filter
      const matchesSearch =
        !q ||
        cls.title.toLowerCase().includes(q) ||
        cls.chapterTitle.toLowerCase().includes(q) ||
        cls.faculty.name.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [subjectDetail, selectedFilter, searchQuery]);

  // Group filtered classes by Chapter
  const chapterGroups = useMemo(() => {
    const map = new Map<string, RecordedClass[]>();

    filteredClasses.forEach((cls) => {
      const list = map.get(cls.chapterTitle) || [];
      list.push(cls);
      map.set(cls.chapterTitle, list);
    });

    return Array.from(map.entries()).map(([chapterTitle, classes]) => {
      const totalMinutes = classes.reduce(
        (sum, c) => sum + Math.round(c.durationSeconds / 60),
        0
      );
      const completedCount = classes.filter(
        (c) => c.status === 'completed'
      ).length;

      return {
        chapterTitle,
        classes,
        totalMinutes,
        completedCount,
        allCompleted: completedCount === classes.length && classes.length > 0,
      };
    });
  }, [filteredClasses]);

  const handleClassPress = (classItem: RecordedClass) => {
    router.push(`/videos/class/${classItem.id}` as any);
  };

  const handleBookmarkToggle = () => {
    if (!subjectDetail) return;
    setIsBookmarked((prev) => {
      const next = !prev;
      Alert.alert(
        next ? 'Bookmarked' : 'Removed Bookmark',
        next
          ? `${subjectDetail.name} recorded classes added to bookmarks.`
          : `${subjectDetail.name} removed from bookmarks.`
      );
      return next;
    });
  };

  const toggleChapterExpanded = (chapterTitle: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterTitle]: !prev[chapterTitle],
    }));
  };

  // Check if all visible chapters are currently collapsed
  const areAllCollapsed = useMemo(() => {
    if (chapterGroups.length === 0) return false;
    return chapterGroups.every((g) => !expandedChapters[g.chapterTitle]);
  }, [chapterGroups, expandedChapters]);

  // Master toggle to collapse or expand all chapter units
  const handleToggleCollapseAll = () => {
    const nextExpanded = areAllCollapsed; // If all collapsed, expand them (true); otherwise collapse them (false)
    const nextState: Record<string, boolean> = {};
    chapterGroups.forEach((g) => {
      nextState[g.chapterTitle] = nextExpanded;
    });
    setExpandedChapters(nextState);
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', gap: 12 }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ fontSize: 14, color: Colors.onSurfaceVariant }}>Loading video classes from database...</Text>
      </View>
    );
  }

  if (!subjectDetail) {
    return (
      <View style={[styles.safeArea, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 }]}>
        <MaterialIcons name="ondemand-video" size={48} color={Colors.primary} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.onSurface }}>Subject Not Found</Text>
        <Text style={{ fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center' }}>
          This subject has no recorded classes in the database yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* 64px Standard Header with Back Button */}
      <VideoSubjectDetailHeader
        subjectName={subjectDetail.name}
        iconName={subjectDetail.iconName}
        iconBgColor={subjectDetail.iconBgColor}
        iconColor={subjectDetail.iconColor}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBookmarkPress={handleBookmarkToggle}
        isBookmarked={isBookmarked}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerWrapper}>
          {/* Subject Overview Hero Banner */}
          <View style={styles.heroCardWrapper}>
            <LinearGradient
              colors={['#0059b9', '#004591', '#002f6c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              {/* Subtle ambient lighting glows */}
              <View style={styles.ambientGlowTop} />
              <View style={styles.ambientGlowBottom} />

              <View style={styles.heroContent}>
                {/* Top Badge Strip */}
                <View style={styles.heroTopRow}>
                  <View style={styles.heroStatsBadge}>
                    <MaterialIcons name="ondemand-video" size={13} color="#d7e2ff" />
                    <Text style={styles.heroStatsBadgeText}>
                      {subjectDetail.videoCount} Classes • {subjectDetail.totalHours} hrs
                    </Text>
                  </View>

                  <View style={styles.highYieldTag}>
                    <Text style={styles.highYieldTagText}>FMGE High-Yield</Text>
                  </View>
                </View>

                {/* Progress Bar & Status */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Course Completion</Text>
                    <Text style={styles.progressPercentText}>
                      {subjectDetail.completedClasses} of {subjectDetail.videoCount} classes •{' '}
                      {subjectDetail.progressPercent}%
                    </Text>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${subjectDetail.progressPercent}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Horizontally Scrollable Filter Tabs */}
          <View style={styles.filterScrollWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsScroll}
            >
              {/* All Classes */}
              <FilterChipItem
                label={`All Classes (${subjectDetail.classes.length})`}
                isActive={selectedFilter === 'all'}
                onPress={() => setSelectedFilter('all')}
              />

              {/* High Yield */}
              <FilterChipItem
                label="High-Yield ★"
                isActive={selectedFilter === 'high-yield'}
                onPress={() => setSelectedFilter('high-yield')}
              />

              {/* In Progress */}
              <FilterChipItem
                label="In Progress"
                isActive={selectedFilter === 'in-progress'}
                onPress={() => setSelectedFilter('in-progress')}
              />

              {/* Completed */}
              <FilterChipItem
                label="Completed ✓"
                isActive={selectedFilter === 'completed'}
                onPress={() => setSelectedFilter('completed')}
              />

              {/* Individual Chapter Pills */}
              {distinctChapters.map((chapterName) => (
                <FilterChipItem
                  key={chapterName}
                  label={chapterName}
                  isActive={selectedFilter === chapterName}
                  onPress={() => setSelectedFilter(chapterName)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Section Header: Title & Count Badge */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Text style={styles.sectionTitle}>Recorded Classes</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {chapterGroups.length}{' '}
                  {chapterGroups.length === 1 ? 'chapter' : 'chapters'} •{' '}
                  {filteredClasses.length} {filteredClasses.length === 1 ? 'class' : 'classes'}
                </Text>
              </View>
            </View>
          </View>

          {/* Chapter-Wise Recorded Classes List */}
          <View style={styles.chaptersContainer}>
            {chapterGroups.length > 0 ? (
              chapterGroups.map((group, groupIndex) => {
                const isExpanded = !!expandedChapters[group.chapterTitle];

                return (
                  <View key={group.chapterTitle} style={styles.chapterSection}>
                    {/* Chapter Section Header Card */}
                    <Pressable
                      onPress={() => toggleChapterExpanded(group.chapterTitle)}
                      style={styles.chapterHeaderCard}
                      accessibilityRole="button"
                      accessibilityLabel={`Chapter ${groupIndex + 1}: ${group.chapterTitle}, ${group.classes.length} classes, ${isExpanded ? 'expanded' : 'collapsed'}`}
                    >
                      <View style={styles.chapterHeaderLeft}>
                        <View style={styles.chapterIconBox}>
                          <MaterialIcons
                            name="menu-book"
                            size={18}
                            color={Colors.primary}
                          />
                        </View>

                        <View style={styles.chapterHeaderInfo}>
                          <View style={styles.chapterNumberRow}>
                            <Text style={styles.chapterIndexLabel}>
                              Chapter {groupIndex + 1 < 10 ? `0${groupIndex + 1}` : groupIndex + 1}
                            </Text>

                            {group.allCompleted && (
                              <View style={styles.chapterDoneBadge}>
                                <MaterialIcons name="check" size={10} color="#059669" />
                                <Text style={styles.chapterDoneText}>Completed</Text>
                              </View>
                            )}
                          </View>

                          <Text style={styles.chapterTitleText} numberOfLines={1}>
                            {group.chapterTitle}
                          </Text>

                          <Text style={styles.chapterMetaText}>
                            {group.classes.length}{' '}
                            {group.classes.length === 1 ? 'class' : 'classes'} •{' '}
                            {group.totalMinutes} mins
                            {group.completedCount > 0 &&
                              ` • ${group.completedCount}/${group.classes.length} watched`}
                          </Text>
                        </View>
                      </View>

                      {/* Collapse / Expand Indicator */}
                      <View style={styles.collapseChevronBox}>
                        <MaterialIcons
                          name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                          size={22}
                          color={Colors.onSurfaceVariant}
                        />
                      </View>
                    </Pressable>

                    {/* Classes in this chapter */}
                    {isExpanded && (
                      <View style={styles.chapterClassesList}>
                        {group.classes.map((cls) => (
                          <RecordedClassCard
                            key={cls.id}
                            item={cls}
                            onPress={() => handleClassPress(cls)}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="video-library"
                  size={48}
                  color={Colors.outlineVariant}
                />
                <Text style={styles.emptyTitle}>No classes match your search</Text>
                <Text style={styles.emptySubtitle}>
                  Try clearing your search query or choosing another filter category.
                </Text>
              </View>
            )}
          </View>

          {/* Bottom spacer for clearance */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Floating Collapse / Expand Units Button in Bottom Right Corner (matching Qbank subject page) */}
      {chapterGroups.length > 0 && (
        <View
          style={[
            styles.floatingCollapseWrap,
            { bottom: Math.max(20, insets.bottom + 16) },
          ]}
          pointerEvents="box-none"
        >
          <AnimatedPressable
            onPress={handleToggleCollapseAll}
            onPressIn={() => {
              collapseBtnScale.value = withSpring(0.92, Motion.tactileSpring);
            }}
            onPressOut={() => {
              collapseBtnScale.value = withSpring(1, Motion.tactileSpring);
            }}
            style={[styles.floatingCollapseBtn, collapseBtnAnimStyle]}
            accessibilityRole="button"
            accessibilityLabel={
              areAllCollapsed
                ? 'Expand all chapter units'
                : 'Collapse all chapter units'
            }
          >
            <LinearGradient
              colors={['#004591', '#0059b9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.floatingCollapseGradient}
            >
              <MaterialIcons
                name={areAllCollapsed ? 'unfold-more' : 'unfold-less'}
                size={17}
                color="#ffffff"
              />
              <Text style={styles.floatingCollapseText}>
                {areAllCollapsed ? 'Expand Units' : 'Collapse Units'}
              </Text>
            </LinearGradient>
          </AnimatedPressable>
        </View>
      )}
    </View>
  );
}

const FilterChipItem: React.FC<{
  label: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ label, isActive, onPress }) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.94, Motion.tactileSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Motion.tactileSpring);
      }}
      style={[
        styles.chip,
        isActive ? styles.chipActive : styles.chipInactive,
        animStyle,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.chipText,
          isActive ? styles.chipTextActive : styles.chipTextInactive,
        ]}
      >
        {label}
      </Text>
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

  /* Hero Card */
  heroCardWrapper: {
    width: '100%',
    borderRadius: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(217, 227, 248, 0.5)',
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(96, 165, 250, 0.22)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(129, 140, 248, 0.18)',
  },
  heroContent: {
    zIndex: 2,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroStatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  heroStatsBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#d7e2ff',
  },
  highYieldTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(254, 240, 138, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(253, 224, 71, 0.4)',
  },
  highYieldTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fef08a',
  },
  progressContainer: {
    gap: 6,
    paddingTop: 2,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#d7e2ff',
  },
  progressPercentText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#34d399',
  },

  /* Horizontally Scrollable Filter Tabs */
  filterScrollWrapper: {
    marginHorizontal: -16,
  },
  filterChipsScroll: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  chipInactive: {
    backgroundColor: '#eaf0ff',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipTextInactive: {
    color: Colors.onSurface,
  },

  /* Section Header */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 9999,
    backgroundColor: Colors.surfaceContainer,
  },
  countBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  collapseToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  collapseToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },

  /* Chapters Container */
  chaptersContainer: {
    gap: 16,
  },
  chapterSection: {
    gap: 10,
  },
  chapterHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    shadowColor: 'rgba(18, 28, 43, 0.03)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  chapterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  chapterIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#eaf0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterHeaderInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  chapterNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chapterIndexLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chapterDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    backgroundColor: '#ecfdf5',
  },
  chapterDoneText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  chapterTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  chapterMetaText: {
    fontSize: 11.5,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  collapseChevronBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterClassesList: {
    gap: 10,
    paddingTop: 2,
  },

  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },

  bottomSpacer: {
    height: 88,
  },

  /* Floating Collapse / Expand Units Button */
  floatingCollapseWrap: {
    position: 'absolute',
    right: 18,
    zIndex: 90,
  },
  floatingCollapseBtn: {
    borderRadius: 9999,
    shadowColor: '#004591',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  floatingCollapseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  floatingCollapseText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});
