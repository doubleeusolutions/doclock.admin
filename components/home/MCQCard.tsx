import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Colors, Motion } from '@/theme';

interface OptionItem {
  id: string;
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

const DEFAULT_OPTIONS: OptionItem[] = [
  { id: 'A', label: 'A', text: 'CK-MB' },
  { id: 'B', label: 'B', text: 'Troponin I' },
  { id: 'C', label: 'C', text: 'Myoglobin' },
  { id: 'D', label: 'D', text: 'LDH' },
];

const CORRECT_OPTION_ID = 'B';

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
  const [selectedOption, setSelectedOption] = useState<string | null>('D'); // Starts with D selected matching initial screenshot/html
  const [isSubmitted, setIsSubmitted] = useState(false);
  const btnScale = useSharedValue(1);

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handleAnswer = () => {
    if (!selectedOption) return;
    if (isSubmitted) {
      // Reset
      setIsSubmitted(false);
      setSelectedOption(null);
    } else {
      setIsSubmitted(true);
    }
  };

  const isUserCorrect = selectedOption === CORRECT_OPTION_ID;

  return (
    <View style={styles.container}>
      {/* Header with Title and Question Counter */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Quick practice</Text>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>Question 4 of 10</Text>
        </View>
      </View>

      {/* Main MCQ Card Container */}
      <View style={styles.card}>
        {/* Scenario Text */}
        <Text style={styles.questionText}>
          A patient presents with severe chest pain radiating to the left arm. Which biomarker is most specific for myocardial injury?
        </Text>

        {/* Options List */}
        <View style={styles.optionsList}>
          {DEFAULT_OPTIONS.map((opt) => (
            <OptionRow
              key={opt.id}
              option={opt}
              isSelected={selectedOption === opt.id}
              isSubmitted={isSubmitted}
              isCorrect={opt.id === CORRECT_OPTION_ID}
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
            <Text style={styles.explanationText}>
              Cardiac troponins (Troponin I and T) are regulatory proteins of myocardial contraction. Because they possess cardiac-specific isoforms not expressed in skeletal muscle, Troponin I is the gold standard biomarker for diagnosing acute myocardial infarction (highest sensitivity and specificity).
            </Text>
          </Animated.View>
        )}

        {/* Answer Button */}
        <View style={styles.actionRow}>
          <AnimatedPressable
            onPress={handleAnswer}
            onPressIn={() => {
              btnScale.value = withSpring(0.95, Motion.tactileSpring);
            }}
            onPressOut={() => {
              btnScale.value = withSpring(1, Motion.tactileSpring);
            }}
            style={[styles.answerButton, btnAnimStyle]}
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
  answerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
