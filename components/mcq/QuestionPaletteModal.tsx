import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/theme';
import { MCQQuestion, UserAnswerState } from '@/data/mcqData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QuestionPaletteModalProps {
  visible: boolean;
  questions: MCQQuestion[];
  currentIndex: number;
  userAnswers: Record<string, UserAnswerState>;
  onClose: () => void;
  onSelectQuestion: (index: number) => void;
  onSubmitEarly?: () => void;
}

export const QuestionPaletteModal: React.FC<QuestionPaletteModalProps> = ({
  visible,
  questions,
  currentIndex,
  userAnswers,
  onClose,
  onSelectQuestion,
  onSubmitEarly,
}) => {
  if (!visible) return null;

  let answeredCount = 0;
  let flaggedCount = 0;
  let unattemptedCount = 0;

  questions.forEach((q) => {
    const ans = userAnswers[q.id];
    if (ans?.isAnswered) {
      answeredCount++;
    } else {
      unattemptedCount++;
    }
    if (ans?.isFlagged) {
      flaggedCount++;
    }
  });

  return (
    <View style={styles.overlayContainer}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.modalContent}>
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Question Palette</Text>
            <Text style={styles.headerSub}>
              {questions.length} total questions
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
          >
            <MaterialIcons name="close" size={20} color={Colors.onSurfaceVariant} />
          </Pressable>
        </View>

        {/* Status Key / Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotAnswered]} />
            <Text style={styles.legendText}>Answered ({answeredCount})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotFlagged]} />
            <Text style={styles.legendText}>Flagged ({flaggedCount})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotUnattempted]} />
            <Text style={styles.legendText}>Skipped ({unattemptedCount})</Text>
          </View>
        </View>

        {/* Question Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
        >
          {questions.map((q, index) => {
            const ans = userAnswers[q.id];
            const isCurrent = index === currentIndex;
            const isAnswered = !!ans?.isAnswered;
            const isFlagged = !!ans?.isFlagged;

            return (
              <Pressable
                key={q.id}
                onPress={() => {
                  onSelectQuestion(index);
                  onClose();
                }}
                style={[
                  styles.gridChip,
                  isAnswered && styles.gridChipAnswered,
                  isFlagged && styles.gridChipFlagged,
                  isCurrent && styles.gridChipCurrent,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Question ${index + 1}`}
              >
                <Text
                  style={[
                    styles.gridChipText,
                    isAnswered && styles.gridChipTextAnswered,
                    isFlagged && styles.gridChipTextFlagged,
                    isCurrent && styles.gridChipTextCurrent,
                  ]}
                >
                  {index + 1}
                </Text>
                {isFlagged && (
                  <View style={styles.chipFlagIcon}>
                    <MaterialIcons name="flag" size={10} color="#b45309" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Bottom Submit Action */}
        {onSubmitEarly && (
          <View style={styles.bottomSection}>
            <Pressable
              onPress={() => {
                onClose();
                onSubmitEarly();
              }}
              style={styles.submitBtn}
              accessibilityRole="button"
            >
              <Text style={styles.submitBtnText}>Finish & Submit Test</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 28, 43, 0.6)',
    justifyContent: 'flex-end',
    zIndex: 10000,
    elevation: 35,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.75,
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 40,
    zIndex: 10,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d9e3f8',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fafbff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(231, 238, 255, 0.9)',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendDotAnswered: {
    backgroundColor: '#10b981',
  },
  legendDotFlagged: {
    backgroundColor: '#f59e0b',
  },
  legendDotUnattempted: {
    backgroundColor: '#d1d5db',
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  gridChip: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#f0f4fc',
    borderWidth: 1.5,
    borderColor: '#e7eeff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gridChipAnswered: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  gridChipFlagged: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  gridChipCurrent: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  gridChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  gridChipTextAnswered: {
    color: '#065f46',
  },
  gridChipTextFlagged: {
    color: '#92400e',
  },
  gridChipTextCurrent: {
    color: Colors.primary,
  },
  chipFlagIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  bottomSection: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(231, 238, 255, 0.9)',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
