import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LivePoll } from '@/data/liveClassesData';
import { Colors } from '@/theme';

interface LivePollTabProps {
  initialPoll?: LivePoll | null;
  onVote?: (optId: string) => void;
}

export const LivePollTab: React.FC<LivePollTabProps> = ({ initialPoll, onVote }) => {
  const poll = initialPoll;
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = (optId: string) => {
    setSelectedOptionId(optId);
    setHasVoted(true);
    onVote?.(optId);
  };

  if (!poll) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="poll" size={44} color={Colors.primary} />
        <Text style={styles.emptyTitle}>No active live poll</Text>
        <Text style={styles.emptySubtitle}>
          Interactive polls launched by faculty will appear here in real-time.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Active Poll Card */}
      <View style={styles.pollCard}>
        {/* Header Badge */}
        <View style={styles.pollHeader}>
          <View style={styles.livePollBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.livePollBadgeText}>ACTIVE LIVE POLL</Text>
          </View>
          <Text style={styles.voteCountText}>
            {(poll.totalVotes || 0) + (hasVoted ? 1 : 0)} votes
          </Text>
        </View>

        {/* Question Text */}
        <Text style={styles.questionText}>{poll.question}</Text>

        {/* Options List */}
        <View style={styles.optionsList}>
          {poll.options.map((opt, index) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrect = index === 0;

            return (
              <Pressable
                key={opt.id}
                onPress={() => handleVote(opt.id)}
                disabled={hasVoted}
                style={[
                  styles.optionBtn,
                  isSelected && styles.optionBtnSelected,
                  hasVoted && isCorrect && styles.optionBtnCorrect,
                ]}
              >
                {/* Background Percentage Bar Fill (if voted) */}
                {hasVoted && (
                  <View
                    style={[
                      styles.percentageFill,
                      {
                        width: `${opt.votesPercent || 25}%`,
                        backgroundColor: isCorrect
                          ? 'rgba(16, 185, 129, 0.15)'
                          : isSelected
                          ? 'rgba(0, 89, 185, 0.12)'
                          : 'rgba(0, 0, 0, 0.04)',
                      },
                    ]}
                  />
                )}

                <View style={styles.optionContentRow}>
                  <View style={styles.radioAndText}>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                        hasVoted && isCorrect && styles.radioCircleCorrect,
                      ]}
                    >
                      {isSelected ? (
                        <View style={styles.radioInnerDot} />
                      ) : hasVoted && isCorrect ? (
                        <MaterialIcons name="check" size={14} color="#ffffff" />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                        hasVoted && isCorrect && styles.optionTextCorrect,
                      ]}
                    >
                      {opt.text}
                    </Text>
                  </View>

                  {hasVoted && (
                    <Text
                      style={[
                        styles.percentageText,
                        isCorrect && styles.percentageTextCorrect,
                      ]}
                    >
                      {opt.votesPercent || 0}%
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
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
  pollCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e7f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 14,
  },
  pollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  livePollBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  livePollBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ef4444',
    letterSpacing: 0.4,
  },
  voteCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 22,
  },
  optionsList: {
    gap: 10,
  },
  optionBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
    position: 'relative',
    minHeight: 48,
    justifyContent: 'center',
  },
  optionBtnSelected: {
    borderColor: '#0059b9',
    backgroundColor: '#f0f6ff',
  },
  optionBtnCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  percentageFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 14,
  },
  optionContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  radioAndText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#0059b9',
  },
  radioCircleCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#10b981',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0059b9',
  },
  optionText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  optionTextSelected: {
    color: '#0059b9',
    fontWeight: '700',
  },
  optionTextCorrect: {
    color: '#047857',
    fontWeight: '700',
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
    marginLeft: 8,
  },
  percentageTextCorrect: {
    color: '#10b981',
  },
});
