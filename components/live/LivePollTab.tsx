import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LivePoll } from '@/data/liveClassesData';
import { Colors } from '@/theme';

interface LivePollTabProps {
  initialPoll?: LivePoll;
}

const DEFAULT_POLL: LivePoll = {
  question:
    'A 26-year-old male with known Wolff-Parkinson-White (WPW) syndrome presents to the ER with rapid, irregular wide-complex tachycardia (Atrial Fibrillation with pre-excitation). Which IV pharmacological agent is strictly CONTRAINDICATED?',
  options: [
    { id: 'opt-1', text: 'Verapamil or Diltiazem (AV Nodal Blockers)', votesPercent: 68 },
    { id: 'opt-2', text: 'Procainamide (Class IA)', votesPercent: 12 },
    { id: 'opt-3', text: 'Ibutilide (Class III)', votesPercent: 9 },
    { id: 'opt-4', text: 'Electrical Synchronized Cardioversion', votesPercent: 11 },
  ],
  totalVotes: 1240,
};

export const LivePollTab: React.FC<LivePollTabProps> = ({ initialPoll }) => {
  const poll = initialPoll || DEFAULT_POLL;
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = (optId: string) => {
    setSelectedOptionId(optId);
    setHasVoted(true);
  };

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
            <Text style={styles.livePollBadgeText}>ACTIVE LIVE POLL #01</Text>
          </View>
          <Text style={styles.voteCountText}>
            {poll.totalVotes + (hasVoted ? 1 : 0)} votes
          </Text>
        </View>

        {/* Question Text */}
        <Text style={styles.questionText}>{poll.question}</Text>

        {/* Options List */}
        <View style={styles.optionsList}>
          {poll.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrect = opt.id === 'opt-1'; // Clinical fact: Verapamil is contraindicated

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
                        width: `${opt.votesPercent}%`,
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
                        <MaterialIcons name="check" size={12} color="#ffffff" />
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
                      {opt.votesPercent}%
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* High-Yield Explanation Reveal (after voting) */}
        {hasVoted && (
          <View style={styles.explanationBox}>
            <View style={styles.explanationHeader}>
              <MaterialIcons name="lightbulb" size={18} color="#d97706" />
              <Text style={styles.explanationTitle}>
                High-Yield Clinical Pearl (Dr. Marcus Vance)
              </Text>
            </View>
            <Text style={styles.explanationBody}>
              <Text style={{ fontWeight: '700' }}>Verapamil, Diltiazem, Digoxin & Beta-blockers</Text>{' '}
              are strictly contraindicated in pre-excited AF (WPW + AF). Blocking the AV node forces all chaotic atrial impulses down the accessory pathway (Bundle of Kent) with a very short refractory period, precipitating rapid ventricular response, Ventricular Fibrillation (VF), and sudden cardiac arrest.
            </Text>
            <View style={styles.doclockNoteRow}>
              <MaterialIcons name="bookmark" size={13} color="#0059b9" />
              <Text style={styles.doclockNoteText}>
                Drug of choice: IV Procainamide or Ibutilide. If unstable: Immediate Synchronized Cardioversion.
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Past Completed Polls */}
      <View style={styles.pastPollsSection}>
        <Text style={styles.pastPollsHeader}>Completed Polls from this Session</Text>
        <View style={styles.pastPollItem}>
          <View style={styles.pastPollRow}>
            <MaterialIcons name="check-circle" size={16} color="#10b981" />
            <Text style={styles.pastPollTitle} numberOfLines={1}>
              Antiarrhythmic with longest half-life (Class III)
            </Text>
          </View>
          <Text style={styles.pastPollAnswer}>
            Result: <Text style={{ fontWeight: '700' }}>Amiodarone (t1/2 ≈ 40-58 days)</Text> • 89% answered correctly
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },
  content: {
    padding: 14,
    gap: 16,
    paddingBottom: 24,
  },

  /* Poll Card */
  pollCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e7f2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    backgroundColor: '#fee2e2',
    paddingHorizontal: 9,
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
    fontSize: 10.5,
    fontWeight: '800',
    color: '#b91c1c',
    letterSpacing: 0.5,
  },
  voteCountText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#727782',
  },
  questionText: {
    fontSize: 14.5,
    fontWeight: '700',
    lineHeight: 21,
    color: '#181c22',
  },

  /* Options */
  optionsList: {
    gap: 10,
  },
  optionBtn: {
    position: 'relative',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e7f2',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    padding: 12,
  },
  optionBtnSelected: {
    borderColor: '#0059b9',
    backgroundColor: '#f6f9ff',
  },
  optionBtnCorrect: {
    borderColor: '#10b981',
  },
  percentageFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  optionContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
    gap: 10,
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
    borderColor: '#c2c7d0',
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
    fontSize: 13,
    fontWeight: '600',
    color: '#2d333e',
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
    color: '#575f6e',
  },
  percentageTextCorrect: {
    color: '#10b981',
  },

  /* Explanation Box */
  explanationBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    gap: 8,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  explanationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400e',
    letterSpacing: 0.3,
  },
  explanationBody: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#78350f',
  },
  doclockNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 8,
    borderRadius: 10,
  },
  doclockNoteText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0059b9',
    flex: 1,
  },

  /* Past Polls */
  pastPollsSection: {
    gap: 8,
  },
  pastPollsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#424752',
    marginLeft: 4,
  },
  pastPollItem: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8ecf4',
    gap: 4,
  },
  pastPollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pastPollTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#181c22',
  },
  pastPollAnswer: {
    fontSize: 11.5,
    color: '#575f6e',
    marginLeft: 22,
  },
});
