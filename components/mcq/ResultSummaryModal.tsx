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
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme';
import { SessionResult } from '@/data/mcqData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ResultSummaryModalProps {
  visible: boolean;
  result: SessionResult | null;
  onReview: () => void;
  onRetake: () => void;
  onFinish: () => void;
}

export const ResultSummaryModal: React.FC<ResultSummaryModalProps> = ({
  visible,
  result,
  onReview,
  onRetake,
  onFinish,
}) => {
  if (!visible || !result) return null;

  const minutes = Math.floor(result.totalTimeSeconds / 60);
  const seconds = result.totalTimeSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

  const avgSeconds =
    result.answeredCount > 0
      ? Math.round(result.totalTimeSeconds / result.answeredCount)
      : 0;

  const isHighScorer = result.accuracyPercentage >= 70;
  const isModerate = result.accuracyPercentage >= 50 && result.accuracyPercentage < 70;

  return (
    <View style={styles.overlayContainer}>
      <View style={styles.card}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top Celebratory Header */}
          <View style={styles.topIconBox}>
            <LinearGradient
              colors={
                isHighScorer
                  ? ['#10b981', '#059669']
                  : isModerate
                  ? ['#0059b9', '#2563eb']
                  : ['#f59e0b', '#d97706']
              }
              style={styles.iconCircle}
            >
              <MaterialIcons
                name={
                  isHighScorer
                    ? 'emoji-events'
                    : isModerate
                    ? 'verified'
                    : 'psychology'
                }
                size={32}
                color="#ffffff"
              />
            </LinearGradient>
          </View>

          <Text style={styles.resultTitle}>
            {isHighScorer
              ? 'Outstanding Drill!'
              : isModerate
              ? 'Good Effort!'
              : 'Drill Completed!'}
          </Text>
          <Text style={styles.topicSubtitle}>
            {result.topicTitle} • {result.subjectName}
          </Text>

          {/* Score Showcase Hero */}
          <LinearGradient
            colors={['#f0f4fc', '#e7eeff']}
            style={styles.scoreHero}
          >
            <View style={styles.scoreRow}>
              <View>
                <Text style={styles.scoreLabel}>YOUR SCORE</Text>
                <Text style={styles.scoreValue}>
                  {result.correctCount}{' '}
                  <Text style={styles.scoreTotal}>/ {result.totalQuestions}</Text>
                </Text>
              </View>

              <View style={styles.accuracyPill}>
                <Text style={styles.accuracyValue}>
                  {result.accuracyPercentage}%
                </Text>
                <Text style={styles.accuracyLabel}>ACCURACY</Text>
              </View>
            </View>

            {/* Breakdown Cards */}
            <View style={styles.breakdownRow}>
              <View style={[styles.statBox, styles.statBoxCorrect]}>
                <MaterialIcons name="check-circle" size={16} color="#059669" />
                <Text style={styles.statNum}>{result.correctCount}</Text>
                <Text style={styles.statText}>Correct</Text>
              </View>

              <View style={[styles.statBox, styles.statBoxIncorrect]}>
                <MaterialIcons name="cancel" size={16} color="#dc2626" />
                <Text style={styles.statNum}>{result.incorrectCount}</Text>
                <Text style={styles.statText}>Incorrect</Text>
              </View>

              <View style={[styles.statBox, styles.statBoxSkipped]}>
                <MaterialIcons name="remove-circle" size={16} color="#6b7280" />
                <Text style={styles.statNum}>{result.skippedCount}</Text>
                <Text style={styles.statText}>Skipped</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Pace & Benchmarking Info */}
          <View style={styles.metaBox}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={18} color={Colors.primary} />
              <View>
                <Text style={styles.metaVal}>{timeFormatted}</Text>
                <Text style={styles.metaSub}>Total Time</Text>
              </View>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <MaterialIcons name="speed" size={18} color={Colors.primary} />
              <View>
                <Text style={styles.metaVal}>{avgSeconds}s / MCQ</Text>
                <Text style={styles.metaSub}>Average Pace</Text>
              </View>
            </View>
          </View>

          {/* Insight Recommendation */}
          <View style={styles.insightBox}>
            <MaterialIcons name="lightbulb" size={20} color="#b45309" />
            <Text style={styles.insightText}>
              {isHighScorer
                ? 'Great mastery! High-yield clinical nerve root concepts are well reinforced in your memory bank.'
                : 'Review the high-yield golden pearls for incorrect questions to target recall retention before next mock.'}
            </Text>
          </View>

          {/* CTAs */}
          <View style={styles.actionsGroup}>
            <Pressable
              onPress={onReview}
              style={styles.reviewBtn}
              accessibilityRole="button"
            >
              <MaterialIcons name="auto-stories" size={18} color="#ffffff" />
              <Text style={styles.reviewBtnText}>Review Explanations & Pearls</Text>
            </Pressable>

            <View style={styles.secondaryRow}>
              <Pressable
                onPress={onRetake}
                style={styles.retakeBtn}
                accessibilityRole="button"
              >
                <MaterialIcons name="replay" size={16} color={Colors.primary} />
                <Text style={styles.retakeBtnText}>Retake Drill</Text>
              </Pressable>

              <Pressable
                onPress={onFinish}
                style={styles.doneBtn}
                accessibilityRole="button"
              >
                <Text style={styles.doneBtnText}>Finish & Return</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 28, 43, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 10001,
    elevation: 45,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    maxHeight: SCREEN_HEIGHT * 0.88,
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 50,
  },
  scrollContent: {
    alignItems: 'center',
  },
  topIconBox: {
    marginBottom: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  topicSubtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 18,
  },
  scoreHero: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(231, 238, 255, 0.9)',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  scoreTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  accuracyPill: {
    alignItems: 'flex-end',
  },
  accuracyValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  accuracyLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  statBoxCorrect: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  statBoxIncorrect: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  statBoxSkipped: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 2,
  },
  statText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  metaBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#fafbff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(231, 238, 255, 0.9)',
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  metaSub: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(231, 238, 255, 0.9)',
  },
  insightBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    lineHeight: 17,
  },
  actionsGroup: {
    width: '100%',
    gap: 10,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  reviewBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: '#ffffff',
  },
  retakeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f0f4fc',
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
});
