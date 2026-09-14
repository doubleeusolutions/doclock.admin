import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme';
import {
  getSubjectDetail,
  CHAPTER_FILTER_TABS,
  ChapterFilterId,
  SubheadingTopic,
  SubjectDetail,
} from '@/data/chaptersData';
import {
  getQuestionsForTopic,
  AttemptMode,
  MCQQuestion,
  SessionResult,
} from '@/data/mcqData';
import { SubjectDetailHeader } from '@/components/qbank/SubjectDetailHeader';
import { ChapterSection } from '@/components/qbank/ChapterSection';
import { ModeSelectionModal } from '@/components/mcq/ModeSelectionModal';
import { McqAttemptModal } from '@/components/mcq/McqAttemptModal';

export default function SubjectDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const subjectId = (id as string) || 'anatomy';

  const [selectedFilter, setSelectedFilter] =
    useState<ChapterFilterId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Subject state allows live progress updates when drills are completed
  const [subjectDetail, setSubjectDetail] = useState<SubjectDetail>(() =>
    getSubjectDetail(subjectId)
  );

  // Modal states for attempting models
  const [activeTopicForMode, setActiveTopicForMode] =
    useState<SubheadingTopic | null>(null);
  const [activeTopicForAttempt, setActiveTopicForAttempt] =
    useState<SubheadingTopic | null>(null);
  const [attemptMode, setAttemptMode] = useState<AttemptMode>('practice');
  const [attemptQuestions, setAttemptQuestions] = useState<MCQQuestion[]>([]);

  // State to track expanded status of each chapter unit (default: all collapsed)
  const [expandedChapterIds, setExpandedChapterIds] = useState<
    Record<string, boolean>
  >({});

  // Filter chapters and their subheadings according to selected filter tab and search query
  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return subjectDetail.chapters
      .map((chapter) => {
        const matchingTopics = chapter.topics.filter((topic) => {
          // Category filter
          let matchesFilter = true;
          if (selectedFilter === 'high-yield') {
            matchesFilter = !!topic.isHighYield;
          } else if (selectedFilter === 'unattempted') {
            matchesFilter = topic.status === 'unattempted';
          } else if (selectedFilter === 'in-progress') {
            matchesFilter = topic.status === 'in-progress';
          } else if (selectedFilter === 'completed') {
            matchesFilter = topic.status === 'completed';
          } else if (selectedFilter === 'image-based') {
            matchesFilter = !!topic.isImageBased;
          }

          // Search query filter
          const matchesSearch =
            !q ||
            topic.title.toLowerCase().includes(q) ||
            chapter.title.toLowerCase().includes(q);

          return matchesFilter && matchesSearch;
        });

        return {
          ...chapter,
          topics: matchingTopics,
        };
      })
      .filter((chapter) => chapter.topics.length > 0);
  }, [subjectDetail, selectedFilter, searchQuery]);

  const completionPercent = Math.min(
    100,
    Math.round(
      (subjectDetail.completedMcqs / (subjectDetail.totalMcqs || 1)) * 100
    )
  );

  // Check if all visible chapters are currently collapsed
  const areAllCollapsed = useMemo(() => {
    if (filteredChapters.length === 0) return false;
    return filteredChapters.every((ch) => !expandedChapterIds[ch.id]);
  }, [filteredChapters, expandedChapterIds]);

  // Master toggle to collapse or expand all chapter units
  const handleToggleCollapseAll = () => {
    setExpandedChapterIds((prev) => {
      const nextState = areAllCollapsed; // If all collapsed, expand them (true); otherwise collapse them (false)
      const updated: Record<string, boolean> = { ...prev };
      filteredChapters.forEach((ch) => {
        updated[ch.id] = nextState;
      });
      return updated;
    });
  };

  const handleToggleChapter = (chapterId: string) => {
    setExpandedChapterIds((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  // Click on a topic opens the pre-attempt mode selection modal
  const handleSelectTopic = (topic: SubheadingTopic) => {
    setActiveTopicForMode(topic);
  };

  // Starting attempt with chosen mode
  const handleStartAttempt = (topic: SubheadingTopic, chosenMode: AttemptMode) => {
    const qList = getQuestionsForTopic(
      topic.id,
      topic.title,
      subjectDetail.subjectName,
      Math.min(10, Math.max(5, topic.mcqCount))
    );
    setAttemptQuestions(qList);
    setAttemptMode(chosenMode);
    setActiveTopicForAttempt(topic);
  };

  // Session completed updates the topic's status and solved count
  const handleSessionComplete = (result: SessionResult) => {
    setSubjectDetail((prev) => {
      const updatedChapters = prev.chapters.map((ch) => ({
        ...ch,
        topics: ch.topics.map((t) => {
          if (t.id === result.topicId) {
            return {
              ...t,
              status: 'completed' as const,
              completedMcqs: Math.max(t.completedMcqs, result.answeredCount),
            };
          }
          return t;
        }),
      }));

      return {
        ...prev,
        completedMcqs: Math.min(
          prev.totalMcqs,
          prev.completedMcqs + result.answeredCount
        ),
        chapters: updatedChapters,
      };
    });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Top Header with Subject Title, Back button & Search */}
      <SubjectDetailHeader
        subjectName={subjectDetail.subjectName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBookmarkPress={() =>
          Alert.alert('Bookmarks', `Saved topics in ${subjectDetail.subjectName}`)
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.responsiveContainer}>
          {/* Subject Overview & Progress Card */}
          <View style={styles.heroWrapper}>
            <LinearGradient
              colors={['#ffffff', '#f0f3ff', '#e7eeff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              {/* Soft ambient background glow */}
              <View style={styles.heroGlowCircle} />

              {/* Top Tag Row */}
              <View style={styles.heroTagRow}>
                <View style={styles.heroBadgeLeft}>
                  <MaterialIcons name="verified" size={13} color="#ffffff" />
                  <Text style={styles.heroBadgeLeftText}>FMGE CURRICULUM</Text>
                </View>

                <View style={styles.heroBadgeRight}>
                  <MaterialIcons name="quiz" size={13} color={Colors.primary} />
                  <Text style={styles.heroBadgeRightText}>
                    {subjectDetail.totalChapters} Chapters • {subjectDetail.totalMcqs} MCQs
                  </Text>
                </View>
              </View>

              {/* Progress Bar & Stat Badges */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeaderRow}>
                  <Text style={styles.progressLabel}>Subject Completion</Text>
                  <Text style={styles.progressPercent}>{completionPercent}%</Text>
                </View>

                <View style={styles.progressBarBg}>
                  <LinearGradient
                    colors={['#0059b9', '#68d7fd']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.max(6, completionPercent)}%` },
                    ]}
                  />
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>
                      {subjectDetail.completedMcqs}/{subjectDetail.totalMcqs}
                    </Text>
                    <Text style={styles.metricKey}>MCQs Solved</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>
                      {subjectDetail.accuracyRate}%
                    </Text>
                    <Text style={styles.metricKey}>Avg Accuracy</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>
                      {filteredChapters.length}
                    </Text>
                    <Text style={styles.metricKey}>Active Chapters</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Filter Tabs Bar */}
          <View style={styles.filterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {CHAPTER_FILTER_TABS.map((tab) => {
                const isActive = selectedFilter === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setSelectedFilter(tab.id)}
                    style={[
                      styles.filterTab,
                      isActive
                        ? styles.filterTabActive
                        : styles.filterTabInactive,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        isActive
                          ? styles.filterTabTextActive
                          : styles.filterTabTextInactive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Chapter Headings & Subheadings List Section */}
          <View style={styles.curriculumSection}>
            <View style={styles.curriculumHeaderRow}>
              <View style={styles.curriculumTitleGroup}>
                <View style={styles.curriculumDot} />
                <Text style={styles.curriculumTitle}>
                  Chapters
                </Text>
              </View>

              <View style={styles.curriculumHeaderRightGroup}>
                {/* <Pressable
                  onPress={handleToggleCollapseAll}
                  style={styles.headerCollapseBtn}
                  accessibilityRole="button"
                  accessibilityLabel={
                    areAllCollapsed ? 'Expand all chapter units' : 'Collapse all chapter units'
                  }
                >
                  <MaterialIcons
                    name={areAllCollapsed ? 'unfold-more' : 'unfold-less'}
                    size={14}
                    color={Colors.primary}
                  />
                  <Text style={styles.headerCollapseBtnText}>
                    {areAllCollapsed ? 'Expand' : 'Collapse'}
                  </Text>
                </Pressable> */}

                <Text style={styles.curriculumBadge}>
                  {filteredChapters.length}{' '}
                  {filteredChapters.length === 1 ? 'Chapter' : 'Chapters'}
                </Text>
              </View>
            </View>

            {filteredChapters.length > 0 ? (
              filteredChapters.map((chapter) => (
                <ChapterSection
                  key={chapter.id}
                  chapter={chapter}
                  isExpanded={!!expandedChapterIds[chapter.id]}
                  onToggleExpanded={() => handleToggleChapter(chapter.id)}
                  onSelectTopic={handleSelectTopic}
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <MaterialIcons
                  name="search-off"
                  size={36}
                  color={Colors.onSurfaceVariant}
                />
                <Text style={styles.emptyTitle}>No topics match your filter</Text>
                <Text style={styles.emptySubtitle}>
                  Try selecting "All Topics" or clearing your search term.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Collapse / Expand Units Button in Bottom Right Corner */}
      {filteredChapters.length > 0 && (
        <View
          style={[
            styles.floatingCollapseWrap,
            { bottom: Math.max(20, insets.bottom + 16) },
          ]}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={handleToggleCollapseAll}
            style={styles.floatingCollapseBtn}
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
          </Pressable>
        </View>
      )}

      {/* Mode Selection Pre-Attempt Modal */}
      {activeTopicForMode && (
        <ModeSelectionModal
          visible={!!activeTopicForMode}
          topicTitle={activeTopicForMode.title}
          subjectName={subjectDetail.subjectName}
          mcqCount={activeTopicForMode.mcqCount}
          durationMinutes={activeTopicForMode.durationMinutes}
          onClose={() => setActiveTopicForMode(null)}
          onStart={(chosenMode) => {
            const topic = activeTopicForMode;
            setActiveTopicForMode(null);
            handleStartAttempt(topic, chosenMode);
          }}
        />
      )}

      {/* Interactive MCQ Attempting Modal */}
      {activeTopicForAttempt && (
        <McqAttemptModal
          visible={!!activeTopicForAttempt}
          topicTitle={activeTopicForAttempt.title}
          subjectName={subjectDetail.subjectName}
          questions={attemptQuestions}
          mode={attemptMode}
          onClose={() => setActiveTopicForAttempt(null)}
          onSessionComplete={handleSessionComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  responsiveContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },

  /* Hero Section */
  heroWrapper: {
    paddingHorizontal: 16,
    marginBottom: 14,
    marginTop: 4,
  },
  heroCard: {
    borderRadius: 20,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(217, 227, 248, 0.6)',
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  heroGlowCircle: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(104, 215, 253, 0.22)',
  },
  heroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
    zIndex: 2,
  },
  heroBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  heroBadgeLeftText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroBadgeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: '#b9eaff',
  },
  heroBadgeRightText: {
    color: '#001f29',
    fontSize: 11,
    fontWeight: '600',
  },
  heroTextContainer: {
    marginBottom: 14,
    zIndex: 2,
  },
  heroSubjectTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSubjectSubtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },

  /* Progress & Metrics */
  progressContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(231, 238, 255, 0.8)',
    zIndex: 2,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f0f3ff',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 2,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  metricKey: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(231, 238, 255, 0.9)',
  },

  /* Filter Tabs */
  filterSection: {
    marginBottom: 14,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 2,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    flexShrink: 0,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  filterTabInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(231, 238, 255, 0.8)',
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  filterTabText: {
    fontSize: 12.5,
  },
  filterTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  filterTabTextInactive: {
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },

  /* Curriculum List */
  curriculumSection: {
    paddingHorizontal: 16,
  },
  curriculumHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  curriculumTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  curriculumDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  curriculumTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  curriculumBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  curriculumHeaderRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerCollapseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    backgroundColor: '#d7e2ff',
  },
  headerCollapseBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
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
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(231, 238, 255, 0.8)',
    marginTop: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
