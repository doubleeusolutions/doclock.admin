import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Motion } from '@/theme';
import {
  TEST_FILTER_TABS,
  TestCategory,
  AssessmentItem,
} from '@/data/testsData';
import { TestsHeader } from '@/components/tests/TestsHeader';
import { AssessmentCard } from '@/components/tests/AssessmentCard';
import { ModeSelectionModal } from '@/components/mcq/ModeSelectionModal';
import { McqAttemptModal } from '@/components/mcq/McqAttemptModal';
import {
  AttemptMode,
  MCQQuestion,
} from '@/data/mcqData';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function TestsScreen() {
  const insets = useSafeAreaInsets();
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | TestCategory>('all');

  const startBtnScale = useSharedValue(1);
  const startBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: startBtnScale.value }],
  }));

  // MCQ attempting modal state
  const [activeTestForMode, setActiveTestForMode] = useState<{
    id: string;
    title: string;
    subjectName: string;
    mcqCount: number;
    durationMinutes: number;
  } | null>(null);
  const [activeTestForAttempt, setActiveTestForAttempt] = useState<{
    id: string;
    title: string;
    subjectName: string;
  } | null>(null);
  const [attemptMode, setAttemptMode] = useState<AttemptMode>('exam');
  const [attemptQuestions, setAttemptQuestions] = useState<MCQQuestion[]>([]);

  // Custom tests state
  const [customTests, setCustomTests] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        // 1. Fetch official assessments
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (isMounted) {
          if (data && data.length > 0) {
            setAssessments(
              data.map((a: any) => ({
                id: a.id,
                title: a.title,
                category: a.category as TestCategory,
                tag: a.tag || 'Standard',
                tagBgColor: a.tag_bg_color || '#d7e2ff',
                tagTextColor: a.tag_text_color || '#0059b9',
                testsCount: a.tests_count || 1,
                mcqsCount: a.mcqs_count || 300,
                durationHours: Number(a.duration_hours || 3.0),
                iconName: a.icon_name || 'stars',
                iconBgColor: a.icon_bg_color || '#d7e2ff',
                iconColor: a.icon_color || '#0059b9',
              }))
            );
          } else {
            setAssessments([]);
          }
        }
        
        // 2. Fetch custom tests
        const { data: userAuth } = await supabase.auth.getUser();
        if (userAuth.user) {
          // Fetch custom tests and get a count of questions using a join
          const { data: ctData, error: ctError } = await supabase
            .from('custom_tests')
            .select('*, custom_test_questions(count)')
            .eq('user_id', userAuth.user.id)
            .order('created_at', { ascending: false });
            
          if (!ctError && ctData && isMounted) {
            setCustomTests(ctData);
          }
        }
      } catch (err) {
        console.warn('[TestsScreen] fetchAssessments error:', err);
        if (isMounted) setAssessments([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAssessments();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartTestFlow = (testInfo: {
    id: string;
    title: string;
    subjectName: string;
    mcqCount: number;
    durationMinutes: number;
  }) => {
    setActiveTestForMode(testInfo);
  };

  const handleStartAttempt = async (
    testInfo: { id: string; title: string; subjectName: string; mcqCount: number },
    chosenMode: AttemptMode
  ) => {
    try {
      let qData: any[] | null = null;
      
      if (testInfo.id.startsWith('custom_')) {
        // Fetch from custom test questions
        const customTestId = testInfo.id.replace('custom_', '');
        const { data: ctQuestions } = await supabase
          .from('custom_test_questions')
          .select('question_id')
          .eq('custom_test_id', customTestId);
          
        if (ctQuestions && ctQuestions.length > 0) {
          const qIds = ctQuestions.map(q => q.question_id);
          const { data: mcqData } = await supabase
            .from('mcq_questions')
            .select('*, options:mcq_options(*)')
            .in('id', qIds);
          qData = mcqData;
        }
      } else {
        // Fetch normal assessment questions
        const { data } = await supabase
          .from('mcq_questions')
          .select('*, options:mcq_options(*)')
          .eq('assessment_id', testInfo.id)
          .limit(50);
        qData = data;
          
        if (!qData || qData.length === 0) {
          const fallbackQuery = await supabase
            .from('mcq_questions')
            .select('*, options:mcq_options(*)')
            .limit(10);
          qData = fallbackQuery.data;
        }
      }

      if (!qData || qData.length === 0) {
        Alert.alert(
          'No Questions Found',
          'There are no questions available for this test.'
        );
        return;
      }

      const qList: MCQQuestion[] = qData.map((q: any) => ({
        id: q.id,
        topicId: q.topic_id || testInfo.id,
        topicTitle: testInfo.title,
        subjectName: testInfo.subjectName,
        questionNumber: q.question_number,
        clinicalVignette: q.clinical_vignette,
        imageUrl: q.image_url,
        imageCaption: q.image_caption,
        difficulty: q.difficulty,
        isHighYield: q.is_high_yield,
        isImageBased: q.is_image_based,
        explanation: {
          overall: q.explanation,
          goldenPearl: q.golden_pearl,
          reference: q.reference || '',
        },
        options: (q.options || []).map((o: any) => ({
          id: o.option_label,
          text: o.option_text,
          isCorrect: o.is_correct,
          peerPercentage: o.peer_percentage || 0,
          explanation: o.option_explanation,
        })),
      })) as any;

      setAttemptQuestions(qList);
      setAttemptMode(chosenMode);
      setActiveTestForAttempt(testInfo);
    } catch (e) {
      console.error('[TestsScreen] Error starting attempt:', e);
    }
  };

  // Filter assessments based on category tab and search query
  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      const matchesTab =
        selectedTab === 'all' ? true : item.category === selectedTab;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [assessments, selectedTab, searchQuery]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Top Header - Consistent 64px, transparent border, DocLock squircle logo */}
      <TestsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBookmarkPress={() => { }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.responsiveContainer}>
          {/* Hero Banner Section */}
          {/* <View style={styles.heroWrapper}>
            <LinearGradient
              colors={['#ffffff', '#f0f3ff', '#e7eeff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            > */}
          {/* Soft ambient glowing circle */}
          {/* <View style={styles.heroGlowCircle} /> */}

          {/* Top Badge Row */}
          {/* <View style={styles.heroBadgeRow}>
                <View style={styles.heroBadgeLeft}>
                  <MaterialIcons name="verified" size={13} color="#ffffff" />
                  <Text style={styles.heroBadgeLeftText}>FMGE EXAM PREP</Text>
                </View>

                <View style={styles.heroBadgeRight}>
                  <MaterialIcons name="quiz" size={13} color={Colors.secondary} />
                  <Text style={styles.heroBadgeRightText}>Mock & Subject • 250+ Tests</Text>
                </View>
              </View> */}

          {/* Main Headline & Subtitle */}
          {/* <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>Tests & Assessments</Text>
                <Text style={styles.heroSubtitle}>
                  Foreign Medical Graduate Exam • Timed Grand Mocks & Subject-wise Test Series with National Percentile Ranking
                </Text>
              </View>
            </LinearGradient>
          </View> */}

          {/* Horizontal Category Filtering Tabs */}
          <View style={styles.tabsSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContent}
            >
              {TEST_FILTER_TABS.map((tab) => {
                const isActive = selectedTab === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setSelectedTab(tab.id)}
                    style={[
                      styles.filterPill,
                      isActive ? styles.filterPillActive : styles.filterPillInactive,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <MaterialIcons
                      name={tab.iconName}
                      size={16}
                      color={isActive ? '#ffffff' : Colors.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.filterPillText,
                        isActive ? styles.filterPillTextActive : styles.filterPillTextInactive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Featured Grand Mock Banner Highlight */}
          <View style={styles.featuredWrapper}>
            <View style={styles.featuredCard}>
              {/* Ambient backdrop glow */}
              <View style={styles.featuredGlow} />

              {/* Live Badge & Enrolled Count */}
              <View style={styles.featuredBadgeRow}>
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.livePillText}>Live Now • Ends in 18 hrs</Text>
                </View>

                <View style={styles.enrolledPill}>
                  <MaterialIcons name="group" size={14} color={Colors.primary} />
                  <Text style={styles.enrolledPillText}>14.2k Enrolled</Text>
                </View>
              </View>

              {/* Title & Specs */}
              <View style={styles.featuredHeader}>
                <Text style={styles.featuredTitle}>Next All-India Grand Mock: FMGE GT-14</Text>
                <View style={styles.featuredSpecsRow}>
                  <MaterialIcons name="timer" size={15} color={Colors.secondary} />
                  <Text style={styles.featuredSpecsText}>
                    300 Questions • 300 Mins • Real Exam Simulation
                  </Text>
                </View>
              </View>

              {/* Metric / Benchmarking Box */}
              <View style={styles.metricBox}>
                <View style={styles.metricLeft}>
                  <View style={styles.metricIconWrap}>
                    <MaterialIcons name="analytics" size={18} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.metricTitle}>All India Benchmarking</Text>
                    <Text style={styles.metricSubtitle}>Rank, Percentile & Weak Topic Insights</Text>
                  </View>
                </View>
                <View style={styles.tierPill}>
                  <Text style={styles.tierPillText}>Free Tier 1</Text>
                </View>
              </View>

              {/* Primary Action CTA */}
              <AnimatedPressable
                onPress={() =>
                  handleStartTestFlow({
                    id: 'gt-14',
                    title: 'All-India Grand Mock: FMGE GT-14',
                    subjectName: 'FMGE Grand Mock',
                    mcqCount: 10,
                    durationMinutes: 15,
                  })
                }
                onPressIn={() => {
                  startBtnScale.value = withSpring(0.98, Motion.tactileSpring);
                }}
                onPressOut={() => {
                  startBtnScale.value = withSpring(1, Motion.tactileSpring);
                }}
                style={[styles.ctaButton, startBtnAnimStyle]}
                accessibilityRole="button"
                accessibilityLabel="Start Grand Mock"
              >
                <Text style={styles.ctaButtonText}>Start Grand Mock</Text>
                <MaterialIcons name="play-arrow" size={20} color="#ffffff" />
              </AnimatedPressable>
            </View>
          </View>

          {/* Custom Tests Section */}
          {customTests.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <View style={[styles.sectionDot, { backgroundColor: '#f59e0b' }]} />
                  <Text style={styles.sectionTitle}>My Custom Tests</Text>
                </View>
                <Text style={styles.sectionBadge}>
                  {customTests.length} Playlists
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              >
                {customTests.map(ct => {
                  const ctQuestionCount = ct.custom_test_questions?.[0]?.count || 0;
                  return (
                    <Pressable
                      key={ct.id}
                      style={{
                        width: 280,
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: 'rgba(231, 238, 255, 0.8)',
                        shadowColor: '#121c2b',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.04,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                      onPress={() => handleStartTestFlow({
                        id: `custom_${ct.id}`,
                        title: ct.title,
                        subjectName: 'Custom Test',
                        mcqCount: ctQuestionCount,
                        durationMinutes: ctQuestionCount * 1, // 1 min per question roughly
                      })}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                          <MaterialIcons name="folder-special" size={20} color="#d97706" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.onSurface }} numberOfLines={1}>
                            {ct.title}
                          </Text>
                          <Text style={{ fontSize: 13, color: Colors.onSurfaceVariant }}>
                            {ctQuestionCount} {ctQuestionCount === 1 ? 'Question' : 'Questions'}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: '600' }}>
                          Start Test
                        </Text>
                        <MaterialIcons name="arrow-forward" size={16} color={Colors.primary} />
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Section Title */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>Subject-Wise Assessments & Series</Text>
            </View>
            <Text style={styles.sectionBadge}>
              {filteredAssessments.length} {filteredAssessments.length === 1 ? 'Test' : 'Tests'}
            </Text>
          </View>

          {/* Assessment Cards List */}
          <View style={styles.assessmentList}>
            {loading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ fontSize: 13, color: Colors.onSurfaceVariant }}>Loading assessments from database...</Text>
              </View>
            ) : filteredAssessments.length > 0 ? (
              filteredAssessments.map((item: AssessmentItem) => (
                <AssessmentCard
                  key={item.id}
                  assessment={item}
                  onPress={() =>
                    handleStartTestFlow({
                      id: item.id,
                      title: item.title,
                      subjectName:
                        item.category === 'grand-tests'
                          ? 'Grand Test'
                          : 'Subject Test',
                      mcqCount: 10,
                      durationMinutes: Math.round(item.durationHours * 30),
                    })
                  }
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="assignment" size={40} color={Colors.primary} />
                <Text style={styles.emptyStateTitle}>No assessments in database</Text>
                <Text style={styles.emptyStateSub}>
                  Run seed.sql in Supabase SQL Editor to populate grand mocks and subject tests.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Pre-Attempt Mode Selection Modal */}
      {activeTestForMode && (
        <ModeSelectionModal
          visible={!!activeTestForMode}
          topicTitle={activeTestForMode.title}
          subjectName={activeTestForMode.subjectName}
          mcqCount={activeTestForMode.mcqCount}
          durationMinutes={activeTestForMode.durationMinutes}
          onClose={() => setActiveTestForMode(null)}
          onStart={(chosenMode) => {
            const test = activeTestForMode;
            setActiveTestForMode(null);
            handleStartAttempt(test, chosenMode);
          }}
        />
      )}

      {/* Full-Screen MCQ Attempting Modal */}
      {activeTestForAttempt && (
        <McqAttemptModal
          visible={!!activeTestForAttempt}
          topicTitle={activeTestForAttempt.title}
          subjectName={activeTestForAttempt.subjectName}
          questions={attemptQuestions}
          mode={attemptMode}
          onClose={() => setActiveTestForAttempt(null)}
        />
      )}
    </View>
  );
}

const webH2Style = { display: 'none' };

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96, // Ample clearance so bottom nav bar does not overlap
  },
  responsiveContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },

  /* Hero Banner */
  heroWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
  heroBadgeRow: {
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
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },

  /* Category Filtering Navigation Tabs */
  tabsSection: {
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 2,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9999,
    flexShrink: 0,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  filterPillInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(231, 238, 255, 0.8)',
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  filterPillText: {
    fontSize: 13,
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  filterPillTextInactive: {
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },

  /* Featured Grand Mock Banner */
  featuredWrapper: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  featuredCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(217, 227, 248, 0.6)',
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  featuredGlow: {
    position: 'absolute',
    right: -30,
    bottom: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(43, 114, 217, 0.08)',
  },
  featuredBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    zIndex: 2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: '#ffdad6',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ba1a1a',
  },
  livePillText: {
    color: '#93000a',
    fontSize: 11,
    fontWeight: '700',
  },
  enrolledPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  enrolledPillText: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '600',
  },
  featuredHeader: {
    marginBottom: 14,
    zIndex: 2,
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  featuredSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featuredSpecsText: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  metricBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f3ff',
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
    zIndex: 2,
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 89, 185, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  metricSubtitle: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  tierPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    backgroundColor: '#d9e3f8',
  },
  tierPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
    zIndex: 2,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Section Title */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },

  /* Assessment List */
  assessmentList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(231, 238, 255, 0.8)',
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 8,
    marginBottom: 4,
  },
  emptyStateSub: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
