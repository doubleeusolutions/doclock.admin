import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme';
import {
  MCQQuestion,
  AttemptMode,
  UserAnswerState,
  SessionResult,
} from '@/data/mcqData';
import { QuestionPaletteModal } from './QuestionPaletteModal';
import { ResultSummaryModal } from './ResultSummaryModal';

interface McqAttemptModalProps {
  visible: boolean;
  topicTitle: string;
  subjectName: string;
  questions: MCQQuestion[];
  mode: AttemptMode;
  onClose: () => void;
  onSessionComplete?: (result: SessionResult) => void;
}

export const McqAttemptModal: React.FC<McqAttemptModalProps> = ({
  visible,
  topicTitle,
  subjectName,
  questions,
  mode: initialMode,
  onClose,
  onSessionComplete,
}) => {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AttemptMode>(initialMode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswerState>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [timerSeconds, setTimerSeconds] = useState(
    initialMode === 'exam' ? questions.length * 60 : 0
  );
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  // Sync mode when initialMode changes or modal opens
  useEffect(() => {
    if (visible) {
      setMode(initialMode);
      setCurrentIndex(0);
      setUserAnswers({});
      setIsReviewMode(false);
      setIsResultOpen(false);
      setIsPaletteOpen(false);
      setTimerSeconds(initialMode === 'exam' ? questions.length * 60 : 0);
      setIsTimerRunning(true);
    }
  }, [visible, initialMode, questions.length]);

  // Timer counter effect
  useEffect(() => {
    if (!visible || !isTimerRunning || isReviewMode) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (mode === 'exam') {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        } else {
          return prev + 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, isTimerRunning, isReviewMode, mode]);

  // Scroll to top when question changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentIndex]);

  const currentQ = questions[currentIndex] || questions[0];
  if (!currentQ) return null;

  const currentAnswer = userAnswers[currentQ.id];
  const isAnswered = !!currentAnswer?.isAnswered;
  const isFlagged = !!currentAnswer?.isFlagged;
  const isBookmarked = !!bookmarkedIds[currentQ.id];

  // Formatting timer
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Option selection handler
  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    // In practice/exam mode, if already answered and struck, or reviewing
    if (isReviewMode) return;

    const isStruck = currentAnswer?.isStruckThrough?.[optionId];
    if (isStruck) return;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        selectedOptionId: optionId,
        isFlagged: prev[currentQ.id]?.isFlagged,
        isStruckThrough: prev[currentQ.id]?.isStruckThrough,
        timeSpentSeconds: (prev[currentQ.id]?.timeSpentSeconds || 0) + 1,
        isAnswered: true,
      },
    }));
  };

  // Toggle strikethrough elimination
  const handleToggleStrike = (optionId: 'A' | 'B' | 'C' | 'D', e?: any) => {
    e?.stopPropagation?.();
    if (isReviewMode) return;

    setUserAnswers((prev) => {
      const currentStrikes = prev[currentQ.id]?.isStruckThrough || {};
      const newStrikes = {
        ...currentStrikes,
        [optionId]: !currentStrikes[optionId],
      };

      // If striking the currently selected option, deselect it
      const selected =
        prev[currentQ.id]?.selectedOptionId === optionId
          ? undefined
          : prev[currentQ.id]?.selectedOptionId;

      return {
        ...prev,
        [currentQ.id]: {
          questionId: currentQ.id,
          selectedOptionId: selected,
          isFlagged: prev[currentQ.id]?.isFlagged,
          isStruckThrough: newStrikes,
          timeSpentSeconds: prev[currentQ.id]?.timeSpentSeconds || 0,
          isAnswered: !!selected,
        },
      };
    });
  };

  // Toggle Flag for review
  const handleToggleFlag = () => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...(prev[currentQ.id] || {
          questionId: currentQ.id,
          timeSpentSeconds: 0,
          isAnswered: false,
        }),
        isFlagged: !prev[currentQ.id]?.isFlagged,
      },
    }));
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    setBookmarkedIds((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  // Calculate and Submit Test
  const handleSubmitTest = () => {
    setIsTimerRunning(false);

    let correct = 0;
    let incorrect = 0;
    let answered = 0;

    questions.forEach((q) => {
      const userAns = userAnswers[q.id];
      if (userAns?.isAnswered && userAns.selectedOptionId) {
        answered++;
        const correctOpt = q.options.find((o) => o.isCorrect);
        if (correctOpt?.id === userAns.selectedOptionId) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    const total = questions.length;
    const skipped = total - answered;
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    const totalTime =
      mode === 'exam' ? questions.length * 60 - timerSeconds : timerSeconds;

    const result: SessionResult = {
      topicId: currentQ.topicId,
      topicTitle,
      subjectName,
      mode,
      totalQuestions: total,
      answeredCount: answered,
      correctCount: correct,
      incorrectCount: incorrect,
      skippedCount: skipped,
      accuracyPercentage: accuracy,
      totalTimeSeconds: Math.max(1, totalTime),
      score: correct,
      userAnswers,
    };

    setSessionResult(result);
    setIsResultOpen(true);
    onSessionComplete?.(result);
  };

  // Prompt exit confirm if in progress
  const handleExitPress = () => {
    if (isReviewMode) {
      onClose();
      return;
    }

    const answeredCount = Object.values(userAnswers).filter(
      (a) => a.isAnswered
    ).length;

    if (answeredCount > 0) {
      Alert.alert(
        'Exit MCQ Session?',
        `You have completed ${answeredCount} of ${questions.length} questions. Your progress for this drill will be saved.`,
        [
          { text: 'Keep Practicing', style: 'cancel' },
          {
            text: 'Submit & View Score',
            style: 'default',
            onPress: handleSubmitTest,
          },
          { text: 'Exit Without Saving', style: 'destructive', onPress: onClose },
        ]
      );
    } else {
      onClose();
    }
  };

  // Count answered questions for the palette badge
  const answeredTotal = Object.values(userAnswers).filter(
    (a) => a.isAnswered
  ).length;

  if (!visible) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Sticky Header (64px standard) */}
      <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Pressable
              onPress={handleExitPress}
              style={styles.iconCircleBtn}
              accessibilityRole="button"
              accessibilityLabel="Exit test"
            >
              <MaterialIcons name="close" size={20} color={Colors.onSurface} />
            </Pressable>

            <View style={styles.headerTitleWrap}>
              <View style={styles.modeBadgeRow}>
                <View
                  style={[
                    styles.modePill,
                    mode === 'exam'
                      ? styles.modePillExam
                      : mode === 'study'
                      ? styles.modePillStudy
                      : styles.modePillPractice,
                  ]}
                >
                  <Text
                    style={[
                      styles.modePillText,
                      mode === 'exam'
                        ? styles.modePillTextExam
                        : mode === 'study'
                        ? styles.modePillTextStudy
                        : styles.modePillTextPractice,
                    ]}
                  >
                    {isReviewMode
                      ? 'REVIEW MODE'
                      : mode === 'exam'
                      ? 'EXAM'
                      : mode === 'study'
                      ? 'STUDY'
                      : 'PRACTICE'}
                  </Text>
                </View>
                <Text style={styles.headerSubName} numberOfLines={1}>
                  {subjectName}
                </Text>
              </View>

              <Text style={styles.headerProgressText}>
                Question {currentIndex + 1} of {questions.length}
              </Text>
            </View>
          </View>

          {/* Right Header Actions */}
          <View style={styles.headerRight}>
            {/* Timer Badge */}
            <View
              style={[
                styles.timerBadge,
                mode === 'exam' && timerSeconds < 120 && styles.timerBadgeUrgent,
              ]}
            >
              <MaterialIcons
                name="schedule"
                size={14}
                color={
                  mode === 'exam' && timerSeconds < 120
                    ? '#dc2626'
                    : Colors.primary
                }
              />
              <Text
                style={[
                  styles.timerText,
                  mode === 'exam' && timerSeconds < 120 && styles.timerTextUrgent,
                ]}
              >
                {formatTime(timerSeconds)}
              </Text>
            </View>

            {/* Bookmark Toggle */}
            <Pressable
              onPress={handleToggleBookmark}
              style={[
                styles.iconCircleBtn,
                isBookmarked && styles.iconCircleBtnActive,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Bookmark question"
            >
              <MaterialIcons
                name={isBookmarked ? 'bookmark' : 'bookmark-border'}
                size={20}
                color={isBookmarked ? Colors.primary : Colors.onSurfaceVariant}
              />
            </Pressable>

            {/* Palette Trigger Button */}
            <Pressable
              onPress={() => setIsPaletteOpen(true)}
              style={styles.paletteTriggerBtn}
              accessibilityRole="button"
              accessibilityLabel="Open question palette"
            >
              <MaterialIcons name="grid-view" size={18} color={Colors.primary} />
              <View style={styles.paletteBadgeCount}>
                <Text style={styles.paletteBadgeText}>
                  {answeredTotal}/{questions.length}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Scrollable Question Content Area */}
        <ScrollView
          ref={scrollRef}
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.responsiveWrapper}>
            {/* Question Card */}
            <View style={styles.questionCard}>
              {/* Question Meta Tags */}
              <View style={styles.qMetaRow}>
                <View style={styles.qMetaLeft}>
                  <View style={styles.qNumPill}>
                    <Text style={styles.qNumText}>Q{currentIndex + 1}</Text>
                  </View>
                  <View
                    style={[
                      styles.diffBadge,
                      currentQ.difficulty === 'Hard'
                        ? styles.diffHard
                        : currentQ.difficulty === 'Moderate'
                        ? styles.diffMod
                        : styles.diffEasy,
                    ]}
                  >
                    <Text style={styles.diffText}>{currentQ.difficulty}</Text>
                  </View>
                  {currentQ.isHighYield && (
                    <View style={styles.hyBadge}>
                      <Text style={styles.hyText}>High Yield</Text>
                    </View>
                  )}
                </View>

                {isFlagged && (
                  <View style={styles.flaggedIndicator}>
                    <MaterialIcons name="flag" size={14} color="#d97706" />
                    <Text style={styles.flaggedText}>Flagged</Text>
                  </View>
                )}
              </View>

              {/* Question Stem / Clinical Vignette */}
              <Text style={styles.vignetteText}>{currentQ.clinicalVignette}</Text>

              {/* Image Spotter (if present) */}
              {currentQ.imageUrl && (
                <View style={styles.imageSpotterWrap}>
                  <Text style={styles.imageSpotterCaption}>
                    {currentQ.imageCaption || 'Clinical Diagnostic Image'}
                  </Text>
                </View>
              )}
            </View>

            {/* Options List */}
            <View style={styles.optionsSection}>
              <Text style={styles.optionsHeading}>Select one answer:</Text>

              {currentQ.options.map((option) => {
                const isSelected = currentAnswer?.selectedOptionId === option.id;
                const isStruck = !!currentAnswer?.isStruckThrough?.[option.id];

                // Reveal answers logic:
                // If in Practice Mode and answered, OR if in Study Mode, OR in Review Mode:
                const shouldReveal =
                  isReviewMode ||
                  mode === 'study' ||
                  (mode === 'practice' && isAnswered);

                const isThisCorrect = option.isCorrect;
                const isThisChosenWrong = isSelected && !option.isCorrect;

                let cardStyle = styles.optCardNormal;
                if (shouldReveal) {
                  if (isThisCorrect) {
                    cardStyle = styles.optCardCorrect;
                  } else if (isThisChosenWrong) {
                    cardStyle = styles.optCardIncorrect;
                  }
                } else if (isSelected) {
                  cardStyle = styles.optCardSelected;
                }

                return (
                  <Pressable
                    key={option.id}
                    onPress={() => handleSelectOption(option.id)}
                    style={[
                      styles.optionCard,
                      cardStyle,
                      isStruck && styles.optionCardStruck,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    {/* Option Letter Circle */}
                    <View
                      style={[
                        styles.letterCircle,
                        shouldReveal && isThisCorrect
                          ? styles.letterCircleCorrect
                          : shouldReveal && isThisChosenWrong
                          ? styles.letterCircleIncorrect
                          : isSelected
                          ? styles.letterCircleSelected
                          : styles.letterCircleNormal,
                      ]}
                    >
                      {shouldReveal && isThisCorrect ? (
                        <MaterialIcons name="check" size={16} color="#ffffff" />
                      ) : shouldReveal && isThisChosenWrong ? (
                        <MaterialIcons name="close" size={16} color="#ffffff" />
                      ) : (
                        <Text
                          style={[
                            styles.letterText,
                            isSelected && styles.letterTextSelected,
                          ]}
                        >
                          {option.id}
                        </Text>
                      )}
                    </View>

                    {/* Option Text Content */}
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.optionText,
                          isStruck && styles.optionTextStruck,
                          shouldReveal && isThisCorrect && styles.optionTextCorrect,
                        ]}
                      >
                        {option.text}
                      </Text>

                      {/* Peer Selection Percentage (revealed in Practice or Review mode) */}
                      {shouldReveal && (
                        <View style={styles.peerStatRow}>
                          <Text style={styles.peerStatText}>
                            {option.peerPercentage}% of students picked this
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Right Strikethrough Elimination Action */}
                    {!shouldReveal && (
                      <Pressable
                        onPress={(e) => handleToggleStrike(option.id, e)}
                        style={styles.strikeBtn}
                        accessibilityRole="button"
                        accessibilityLabel={`Strike out option ${option.id}`}
                      >
                        <MaterialIcons
                          name={isStruck ? 'undo' : 'strikethrough-s'}
                          size={18}
                          color={isStruck ? Colors.primary : '#9ca3af'}
                        />
                      </Pressable>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Explanation & Clinical Pearl Section */}
            {(isReviewMode || mode === 'study' || (mode === 'practice' && isAnswered)) && (
              <View style={styles.explanationSection}>
                <View style={styles.expHeader}>
                  <MaterialIcons name="menu-book" size={20} color={Colors.primary} />
                  <Text style={styles.expTitle}>Clinical Rationale & Pearls</Text>
                </View>

                {/* Overall Explanation */}
                <Text style={styles.expBody}>{currentQ.explanation.overall}</Text>

                {/* Golden Pearl Callout */}
                <View style={styles.goldenPearlCard}>
                  <View style={styles.pearlTitleRow}>
                    <MaterialIcons name="wb-incandescent" size={18} color="#b45309" />
                    <Text style={styles.pearlHeading}>HIGH-YIELD GOLDEN PEARL</Text>
                  </View>
                  <Text style={styles.pearlBodyText}>
                    {currentQ.explanation.goldenPearl}
                  </Text>
                </View>

                {/* Why other options are incorrect */}
                {currentQ.explanation.whyOtherOptionsWrong &&
                  currentQ.explanation.whyOtherOptionsWrong.length > 0 && (
                    <View style={styles.whyWrongBox}>
                      <Text style={styles.whyWrongHeading}>
                        Option Breakdown:
                      </Text>
                      {currentQ.explanation.whyOtherOptionsWrong.map((item) => (
                        <View key={item.optionId} style={styles.whyWrongItem}>
                          <Text style={styles.whyWrongLetter}>
                            Option {item.optionId}:
                          </Text>
                          <Text style={styles.whyWrongText}>{item.reason}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                {/* Reference Footer */}
                <View style={styles.referenceFooter}>
                  <MaterialIcons name="auto-stories" size={14} color={Colors.onSurfaceVariant} />
                  <Text style={styles.referenceText}>
                    Ref: {currentQ.explanation.reference}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Sticky Bottom Navigation Bar */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(12, insets.bottom) }]}>
          <View style={styles.bottomBarInner}>
            {/* Previous Button */}
            <Pressable
              onPress={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              style={[
                styles.navBtn,
                styles.prevBtn,
                currentIndex === 0 && styles.navBtnDisabled,
              ]}
              accessibilityRole="button"
            >
              <MaterialIcons
                name="arrow-back"
                size={18}
                color={currentIndex === 0 ? '#9ca3af' : Colors.onSurface}
              />
              <Text
                style={[
                  styles.prevBtnText,
                  currentIndex === 0 && styles.navTextDisabled,
                ]}
              >
                Previous
              </Text>
            </Pressable>

            {/* Flag for Review Toggle */}
            <Pressable
              onPress={handleToggleFlag}
              style={[
                styles.flagBtn,
                isFlagged && styles.flagBtnActive,
              ]}
              accessibilityRole="button"
            >
              <MaterialIcons
                name={isFlagged ? 'flag' : 'outlined-flag'}
                size={18}
                color={isFlagged ? '#ffffff' : '#92400e'}
              />
              <Text
                style={[
                  styles.flagBtnText,
                  isFlagged && styles.flagBtnTextActive,
                ]}
              >
                {isFlagged ? 'Flagged' : 'Flag'}
              </Text>
            </Pressable>

            {/* Next / Submit Button */}
            {currentIndex < questions.length - 1 ? (
              <Pressable
                onPress={() =>
                  setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
                }
                style={styles.nextBtnWrap}
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={['#0059b9', '#2563eb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextBtnGradient}
                >
                  <Text style={styles.nextBtnText}>Next</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
                </LinearGradient>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleSubmitTest}
                style={styles.submitBtnWrap}
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={['#059669', '#10b981']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitBtnGradient}
                >
                  <MaterialIcons name="check-circle" size={18} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Submit Drill</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </View>

        {/* Question Palette Modal */}
        <QuestionPaletteModal
          visible={isPaletteOpen}
          questions={questions}
          currentIndex={currentIndex}
          userAnswers={userAnswers}
          onClose={() => setIsPaletteOpen(false)}
          onSelectQuestion={(idx) => setCurrentIndex(idx)}
          onSubmitEarly={!isReviewMode ? handleSubmitTest : undefined}
        />

        {/* Result Summary Modal */}
        <ResultSummaryModal
          visible={isResultOpen}
          result={sessionResult}
          onReview={() => {
            setIsResultOpen(false);
            setIsReviewMode(true);
            setCurrentIndex(0);
          }}
          onRetake={() => {
            setIsResultOpen(false);
            setUserAnswers({});
            setCurrentIndex(0);
            setIsReviewMode(false);
            setTimerSeconds(mode === 'exam' ? questions.length * 60 : 0);
            setIsTimerRunning(true);
          }}
          onFinish={() => {
            setIsResultOpen(false);
            onClose();
          }}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f8fafd',
    zIndex: 9999,
    elevation: 30,
  },
  headerBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 238, 255, 0.8)',
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleBtnActive: {
    backgroundColor: '#d7e2ff',
  },
  headerTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  modeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  modePillPractice: {
    backgroundColor: '#d7e2ff',
  },
  modePillTextPractice: {
    color: '#004591',
    fontSize: 9,
    fontWeight: '700',
  },
  modePillExam: {
    backgroundColor: '#fee2e2',
  },
  modePillTextExam: {
    color: '#dc2626',
    fontSize: 9,
    fontWeight: '700',
  },
  modePillStudy: {
    backgroundColor: '#d1fae5',
  },
  modePillTextStudy: {
    color: '#065f46',
    fontSize: 9,
    fontWeight: '700',
  },
  modePillText: {
    fontSize: 9,
    fontWeight: '700',
  },
  headerSubName: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    flexShrink: 1,
  },
  headerProgressText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f4fc',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(231, 238, 255, 0.9)',
  },
  timerBadgeUrgent: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  timerTextUrgent: {
    color: '#dc2626',
  },
  paletteTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d7e2ff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paletteBadgeCount: {
    paddingHorizontal: 4,
  },
  paletteBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(231, 238, 255, 0.9)',
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  qMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  qMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qNumPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#0059b9',
  },
  qNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diffEasy: {
    backgroundColor: '#d1fae5',
  },
  diffMod: {
    backgroundColor: '#dbeafe',
  },
  diffHard: {
    backgroundColor: '#fee2e2',
  },
  diffText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1f2937',
  },
  hyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#e5deff',
  },
  hyText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#5b4aba',
  },
  flaggedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#fef3c7',
  },
  flaggedText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#b45309',
  },
  vignetteText: {
    fontSize: 15.5,
    lineHeight: 24,
    color: '#1e293b',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  imageSpotterWrap: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
  },
  imageSpotterCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  optionsSection: {
    marginBottom: 20,
  },
  optionsHeading: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingLeft: 4,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  optCardNormal: {
    borderColor: 'rgba(231, 238, 255, 0.95)',
  },
  optCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#f4f8ff',
  },
  optCardCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  optCardIncorrect: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  optionCardStruck: {
    opacity: 0.45,
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  letterCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  letterCircleNormal: {
    backgroundColor: '#f0f4fc',
  },
  letterCircleSelected: {
    backgroundColor: Colors.primary,
  },
  letterCircleCorrect: {
    backgroundColor: '#10b981',
  },
  letterCircleIncorrect: {
    backgroundColor: '#ef4444',
  },
  letterText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  letterTextSelected: {
    color: '#ffffff',
  },
  optionContent: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurface,
    fontWeight: '500',
  },
  optionTextStruck: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  optionTextCorrect: {
    color: '#065f46',
    fontWeight: '700',
  },
  peerStatRow: {
    marginTop: 4,
  },
  peerStatText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  strikeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  explanationSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(231, 238, 255, 0.95)',
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  expHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  expTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  expBody: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
    marginBottom: 14,
  },
  goldenPearlCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 14,
  },
  pearlTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  pearlHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: 0.5,
  },
  pearlBodyText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#78350f',
    fontWeight: '600',
  },
  whyWrongBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  whyWrongHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 8,
  },
  whyWrongItem: {
    marginBottom: 6,
  },
  whyWrongLetter: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#dc2626',
  },
  whyWrongText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
  },
  referenceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  referenceText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  bottomBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(231, 238, 255, 0.9)',
    paddingTop: 10,
    paddingHorizontal: 16,
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
    gap: 8,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#f0f4fc',
  },
  prevBtn: {
    minWidth: 96,
    justifyContent: 'center',
  },
  prevBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navTextDisabled: {
    color: '#9ca3af',
  },
  flagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
  },
  flagBtnActive: {
    backgroundColor: '#d97706',
  },
  flagBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
  },
  flagBtnTextActive: {
    color: '#ffffff',
  },
  nextBtnWrap: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  nextBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  submitBtnWrap: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
