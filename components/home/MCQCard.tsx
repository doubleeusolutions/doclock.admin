import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Colors, Motion } from '@/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface OptionItem {
  id: string;
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect: boolean;
}

interface QuestionData {
  id: string;
  questionNumber: number;
  clinicalVignette: string;
  explanation: string;
  goldenPearl?: string;
  options: OptionItem[];
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const OptionRow: React.FC<{
  option: OptionItem;
  isSelected: boolean;
  isSubmitted: boolean;
  isCorrect: boolean;
  onSelect: () => void;
}> = ({ option, isSelected, isSubmitted, isCorrect, onSelect }) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  let containerBg: string = '#f0f4fc';
  let hasBorder: boolean = false;
  let borderColor: string = 'transparent';
  let badgeBg: string = '#ffffff';
  let badgeTextColor: string = Colors.onSurface;
  let showCheck: boolean = isSelected;

  if (isSubmitted) {
    if (isCorrect) {
      containerBg = '#d1fae5';
      hasBorder = true;
      borderColor = '#10b981';
      badgeBg = '#10b981';
      badgeTextColor = '#ffffff';
      showCheck = true;
    } else if (isSelected && !isCorrect) {
      containerBg = '#ffdad6';
      hasBorder = true;
      borderColor = '#ba1a1a';
      badgeBg = '#ba1a1a';
      badgeTextColor = '#ffffff';
      showCheck = false;
    }
  } else if (isSelected) {
    containerBg = '#d7e2ff';
    hasBorder = true;
    borderColor = 'rgba(0, 89, 185, 0.25)';
    badgeBg = Colors.primary;
    badgeTextColor = '#ffffff';
  }

  return (
    <AnimatedPressable
      onPress={isSubmitted ? undefined : onSelect}
      onPressIn={() => {
        if (!isSubmitted) scale.value = withSpring(0.98, Motion.tactileSpring);
      }}
      onPressOut={() => {
        if (!isSubmitted) scale.value = withSpring(1, Motion.tactileSpring);
      }}
      style={[
        styles.optionButton,
        {
          backgroundColor: containerBg,
          borderWidth: hasBorder ? 2 : 0,
          borderColor,
        },
        animStyle,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`Option ${option.label}: ${option.text}`}
    >
      <View style={styles.optionLeft}>
        <View style={[styles.optionBadge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeTextColor }]}>
            {option.label}
          </Text>
        </View>
        <Text style={styles.optionText}>{option.text}</Text>
      </View>

      {showCheck && (
        <MaterialIcons
          name="check-circle"
          size={22}
          color={isSubmitted && isCorrect ? '#10b981' : Colors.primary}
        />
      )}
    </AnimatedPressable>
  );
};

export const MCQCard: React.FC = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const btnScale = useSharedValue(1);

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  useEffect(() => {
    let isMounted = true;
    const fetchDailyQuestion = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('mcq_questions')
          .select('*, options:mcq_options(*)')
          .order('question_number', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (isMounted && data) {
          const rawOptions = data.options || [];
          const sortedOptions = rawOptions
            .sort((a: any, b: any) => (a.option_label || '').localeCompare(b.option_label || ''))
            .map((o: any) => ({
              id: o.option_label,
              label: o.option_label as 'A' | 'B' | 'C' | 'D',
              text: o.option_text,
              isCorrect: !!o.is_correct,
            }));

          setQuestion({
            id: data.id,
            questionNumber: data.question_number || 1,
            clinicalVignette: data.clinical_vignette,
            explanation: data.explanation,
            goldenPearl: data.golden_pearl,
            options: sortedOptions,
          });
        } else if (isMounted) {
          setQuestion(null);
        }
      } catch (err: any) {
        console.warn('[MCQCard] fetchDailyQuestion error:', err.message);
        if (isMounted) setQuestion(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDailyQuestion();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAnswer = async () => {
    if (!selectedOption || !question) return;
    if (isSubmitted) {
      // Reset
      setIsSubmitted(false);
      setSelectedOption(null);
    } else {
      setIsSubmitted(true);
      // If user is authenticated, record quiz attempt
      if (user) {
        try {
          const chosenOpt = question.options.find((o) => o.id === selectedOption);
          await supabase.from('quiz_attempts').insert({
            user_id: user.id,
            mode: 'practice',
            total_questions: 1,
            answered_count: 1,
            correct_count: chosenOpt?.isCorrect ? 1 : 0,
            incorrect_count: chosenOpt?.isCorrect ? 0 : 1,
            skipped_count: 0,
            accuracy_percentage: chosenOpt?.isCorrect ? 100 : 0,
            score: chosenOpt?.isCorrect ? 1 : 0,
            total_time_seconds: 15,
            status: 'completed',
          });
        } catch (e) {
          console.error('[MCQCard] Error recording answer:', e);
        }
      }
    }
  };

  const correctOption = question?.options.find((o) => o.isCorrect);
  const isUserCorrect = selectedOption === correctOption?.id;

  return (
    <View style={styles.container}>
      {/* Header with Title and Question Counter */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Quick practice</Text>
        {question && (
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>Daily Question #{question.questionNumber}</Text>
          </View>
        )}
      </View>

      {/* Main MCQ Card Container */}
      <View style={styles.card}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading question from database...</Text>
          </View>
        ) : !question ? (
          <View style={styles.emptyBox}>
            <MaterialIcons name="quiz" size={32} color={Colors.primary} />
            <Text style={styles.emptyTitle}>No questions found in database</Text>
            <Text style={styles.emptySubtitle}>
              Run seed.sql in your Supabase SQL Editor to populate high-yield clinical MCQs.
            </Text>
          </View>
        ) : (
          <>
            {/* Scenario Text */}
            <Text style={styles.questionText}>{question.clinicalVignette}</Text>

            {/* Options List */}
            <View style={styles.optionsList}>
              {question.options.map((opt) => (
                <OptionRow
                  key={opt.id}
                  option={opt}
                  isSelected={selectedOption === opt.id}
                  isSubmitted={isSubmitted}
                  isCorrect={opt.isCorrect}
                  onSelect={() => setSelectedOption(opt.id)}
                />
              ))}
            </View>

            {/* Clinical Explanation feedback upon submission */}
            {isSubmitted && (
              <Animated.View entering={FadeIn.duration(250)} style={styles.explanationBox}>
                <View style={styles.explanationHeader}>
                  <MaterialIcons
                    name={isUserCorrect ? 'check-circle' : 'info'}
                    size={18}
                    color={isUserCorrect ? '#10b981' : Colors.primary}
                  />
                  <Text
                    style={[
                      styles.explanationTitle,
                      { color: isUserCorrect ? '#065f46' : Colors.primary },
                    ]}
                  >
                    {isUserCorrect ? 'Correct Analysis' : 'High-Yield Clinical Review'}
                  </Text>
                </View>
                <Text style={styles.explanationText}>{question.explanation}</Text>
                {question.goldenPearl && (
                  <View style={styles.pearlBox}>
                    <Text style={styles.pearlTitle}>Golden Pearl:</Text>
                    <Text style={styles.pearlText}>{question.goldenPearl}</Text>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Answer Button */}
            <View style={styles.actionRow}>
              <AnimatedPressable
                onPress={handleAnswer}
                disabled={!selectedOption}
                onPressIn={() => {
                  btnScale.value = withSpring(0.95, Motion.tactileSpring);
                }}
                onPressOut={() => {
                  btnScale.value = withSpring(1, Motion.tactileSpring);
                }}
                style={[
                  styles.answerButton,
                  !selectedOption && styles.answerButtonDisabled,
                  btnAnimStyle,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Submit answer"
              >
                <Text style={styles.answerButtonText}>
                  {isSubmitted ? 'Try Again' : 'Answer'}
                </Text>
                <MaterialIcons
                  name={isSubmitted ? 'refresh' : 'arrow-forward'}
                  size={18}
                  color="#ffffff"
                />
              </AnimatedPressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  counterBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: Colors.surfaceContainer,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  card: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 16,
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.onSurface,
    lineHeight: 24,
  },
  optionsList: {
    gap: 10,
  },
  optionButton: {
    width: '100%',
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.onSurface,
    flex: 1,
  },
  explanationBox: {
    backgroundColor: '#f0f4fc',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.4)',
    gap: 6,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.onSurfaceVariant,
  },
  pearlBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(194, 198, 213, 0.4)',
    gap: 2,
  },
  pearlTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  pearlText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.onSurface,
    lineHeight: 17,
  },
  actionRow: {
    paddingTop: 4,
    alignItems: 'flex-end',
  },
  answerButton: {
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 9999,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  answerButtonDisabled: {
    opacity: 0.5,
  },
  answerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
