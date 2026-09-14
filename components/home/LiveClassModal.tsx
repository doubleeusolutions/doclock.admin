import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LiveClassSession } from '@/data/liveClassesData';
import { Colors, Motion } from '@/theme';

interface LiveClassModalProps {
  visible: boolean;
  session: LiveClassSession | null;
  onClose: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const LiveClassModal: React.FC<LiveClassModalProps> = ({
  visible,
  session,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(
    null
  );
  const [isHandRaised, setIsHandRaised] = useState(false);

  const enterBtnScale = useSharedValue(1);
  const enterBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: enterBtnScale.value }],
  }));

  if (!visible || !session) return null;

  const handleVote = (optionId: string) => {
    setSelectedPollOption(optionId);
  };

  const handleRaiseHand = () => {
    setIsHandRaised((prev) => {
      const next = !prev;
      Alert.alert(
        next ? 'Hand Raised ✋' : 'Hand Lowered',
        next
          ? 'You are placed in queue for direct audio question with the faculty.'
          : 'Removed from faculty audio queue.'
      );
      return next;
    });
  };

  const handleEnterFullRoom = () => {
    onClose();
    router.push(`/live/${session.id}` as any);
  };

  return (
    <View style={[styles.modalScreen, { paddingTop: insets.top }]}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.livePulseTag}>
            <View style={styles.liveRedDot} />
            <Text style={styles.liveTagText}>{session.badgeText}</Text>
          </View>
          <View style={styles.viewerBadge}>
            <MaterialIcons name="visibility" size={13} color="#0059b9" />
            <Text style={styles.viewerBadgeText}>{session.viewerCount}</Text>
          </View>
        </View>

        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close live session"
        >
          <MaterialIcons name="close" size={22} color={Colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Video Stage */}
        <View style={styles.stageCard}>
          <Image
            source={{ uri: session.thumbnailUrl }}
            style={styles.stageImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0.25)',
              'rgba(18, 28, 43, 0.85)',
              'rgba(10, 15, 26, 0.98)',
            ]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Stage Overlay Content */}
          <View style={styles.stageOverlay}>
            {/* Top Watermark */}
            <View style={styles.stageHeaderRow}>
              <View style={styles.doclockWatermark}>
                <MaterialIcons name="local-hospital" size={14} color="#68d7fd" />
                <Text style={styles.doclockWatermarkText}>DOCLOCK LIVE STREAM</Text>
              </View>
              <View style={styles.audioWaveBox}>
                <View style={[styles.waveBar, { height: 8 }]} />
                <View style={[styles.waveBar, { height: 16 }]} />
                <View style={[styles.waveBar, { height: 12 }]} />
                <View style={[styles.waveBar, { height: 18 }]} />
                <View style={[styles.waveBar, { height: 10 }]} />
              </View>
            </View>

            {/* Faculty PIP Box */}
            <View style={styles.facultyPipCard}>
              <Image
                source={{ uri: session.faculty.avatar }}
                style={styles.pipAvatar}
              />
              <View style={styles.pipInfo}>
                <Text style={styles.pipName}>{session.faculty.name}</Text>
                <Text style={styles.pipTitle} numberOfLines={1}>
                  {session.faculty.title}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Session Overview Block */}
        <View style={styles.infoCard}>
          <View style={styles.subjectPillRow}>
            <View style={styles.subjectPill}>
              <Text style={styles.subjectPillText}>
                {session.subject} • {session.chapter}
              </Text>
            </View>
            <View style={styles.timerPill}>
              <MaterialIcons name="schedule" size={13} color={Colors.primary} />
              <Text style={styles.timerPillText}>{session.timeString}</Text>
            </View>
          </View>

          <Text style={styles.sessionTitle}>{session.title}</Text>

          {/* Hand Raise & Audio Q&A Controls */}
          <View style={styles.interactionRow}>
            <Pressable
              onPress={handleRaiseHand}
              style={[
                styles.handRaiseBtn,
                isHandRaised && styles.handRaiseBtnActive,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Raise hand to ask question"
            >
              <MaterialIcons
                name="pan-tool"
                size={16}
                color={isHandRaised ? '#ffffff' : Colors.primary}
              />
              <Text
                style={[
                  styles.handRaiseBtnText,
                  isHandRaised && styles.handRaiseBtnTextActive,
                ]}
              >
                {isHandRaised ? 'Hand Raised (In Queue)' : 'Raise Hand for Q&A'}
              </Text>
            </Pressable>

            <View style={styles.micStatusBox}>
              <MaterialIcons name="mic" size={16} color="#10b981" />
              <Text style={styles.micStatusText}>Faculty Live Audio</Text>
            </View>
          </View>
        </View>

        {/* Real-Time Interactive Clinical Poll */}
        {session.poll && (
          <View style={styles.pollCard}>
            <View style={styles.pollHeader}>
              <View style={styles.pollBadge}>
                <MaterialIcons name="how-to-vote" size={15} color="#ffffff" />
                <Text style={styles.pollBadgeText}>LIVE CLINICAL POLL</Text>
              </View>
              <Text style={styles.pollVotesCount}>
                {session.poll.totalVotes + (selectedPollOption ? 1 : 0)} votes
              </Text>
            </View>

            <Text style={styles.pollQuestion}>{session.poll.question}</Text>

            <View style={styles.pollOptionsList}>
              {session.poll.options.map((opt) => {
                const isSelected = selectedPollOption === opt.id;
                const hasVoted = !!selectedPollOption;

                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => handleVote(opt.id)}
                    style={[
                      styles.pollOptionBtn,
                      isSelected && styles.pollOptionBtnSelected,
                    ]}
                    accessibilityRole="button"
                  >
                    {/* Visual progress bar fill */}
                    {hasVoted && (
                      <View
                        style={[
                          styles.pollProgressFill,
                          { width: `${opt.votesPercent}%` },
                          isSelected && styles.pollProgressFillSelected,
                        ]}
                      />
                    )}

                    <View style={styles.pollOptionContent}>
                      <Text
                        style={[
                          styles.pollOptionText,
                          isSelected && styles.pollOptionTextSelected,
                        ]}
                      >
                        {opt.text}
                      </Text>
                      {hasVoted && (
                        <Text
                          style={[
                            styles.pollPercentText,
                            isSelected && styles.pollPercentTextSelected,
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
          </View>
        )}

        {/* Agenda & Key Clinical Pearls */}
        <View style={styles.agendaCard}>
          <Text style={styles.agendaTitle}>Agenda & Focus Points</Text>
          <View style={styles.agendaList}>
            {session.keyTopics.map((topic, idx) => (
              <View key={idx} style={styles.agendaItem}>
                <View style={styles.agendaBullet}>
                  <Text style={styles.agendaBulletText}>{idx + 1}</Text>
                </View>
                <Text style={styles.agendaItemText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Live Chat Teaser */}
        <View style={styles.chatPreviewCard}>
          <View style={styles.chatHeader}>
            <MaterialIcons name="chat" size={15} color={Colors.primary} />
            <Text style={styles.chatHeaderText}>Live Student Discussion</Text>
          </View>

          <View style={styles.chatSnippet}>
            <Text style={styles.chatAuthor}>Dr. Rahul (FMGE Aspirant):</Text>
            <Text style={styles.chatMessage}>
              "Is Adenosine safe in severe bronchial asthma patients?"
            </Text>
          </View>

          <View style={styles.chatSnippet}>
            <Text style={styles.chatAuthorFaculty}>
              {session.faculty.name}:
            </Text>
            <Text style={styles.chatMessage}>
              "Asthma is a strict contraindication! Use Verapamil or DC cardioversion instead."
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Bottom Join Action */}
      <View
        style={[
          styles.bottomActionWrap,
          { paddingBottom: Math.max(16, insets.bottom + 12) },
        ]}
      >
        <AnimatedPressable
          onPress={handleEnterFullRoom}
          onPressIn={() => {
            enterBtnScale.value = withSpring(0.95, Motion.tactileSpring);
          }}
          onPressOut={() => {
            enterBtnScale.value = withSpring(1, Motion.tactileSpring);
          }}
          style={[styles.enterButton, enterBtnAnimStyle]}
          accessibilityRole="button"
          accessibilityLabel="Enter full live classroom"
        >
          <LinearGradient
            colors={['#0059b9', '#004591']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.enterButtonGradient}
          >
            <MaterialIcons name="meeting-room" size={20} color="#ffffff" />
            <Text style={styles.enterButtonText}>
              Enter Full Live Classroom
            </Text>
          </LinearGradient>
        </AnimatedPressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    zIndex: 9999,
    elevation: 9999,
  },
  topBar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f7',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePulseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: '#ef4444',
  },
  liveRedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  liveTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: '#e7eeff',
  },
  viewerBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0059b9',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f3fa',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },

  /* Video Stage */
  stageCard: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#121c2b',
  },
  stageImage: {
    ...StyleSheet.absoluteFillObject,
  },
  stageOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  stageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doclockWatermark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  doclockWatermarkText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#68d7fd',
    letterSpacing: 0.5,
  },
  audioWaveBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 18,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: '#10b981',
  },
  facultyPipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  pipAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#68d7fd',
  },
  pipInfo: {
    flex: 1,
  },
  pipName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  pipTitle: {
    fontSize: 10.5,
    color: '#93c5fd',
  },

  /* Info Card */
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },
  subjectPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectPill: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 9999,
    backgroundColor: Colors.surfaceContainer,
  },
  subjectPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  sessionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.3,
    lineHeight: 23,
  },
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(194, 198, 213, 0.25)',
  },
  handRaiseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: '#eaf1ff',
  },
  handRaiseBtnActive: {
    backgroundColor: Colors.primary,
  },
  handRaiseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  handRaiseBtnTextActive: {
    color: '#ffffff',
  },
  micStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  micStatusText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#059669',
  },

  /* Poll Card */
  pollCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  pollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pollBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    backgroundColor: '#6366f1',
  },
  pollBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  pollVotesCount: {
    fontSize: 11.5,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  pollQuestion: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 20,
  },
  pollOptionsList: {
    gap: 8,
  },
  pollOptionBtn: {
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    position: 'relative',
    minHeight: 44,
    justifyContent: 'center',
  },
  pollOptionBtnSelected: {
    borderColor: Colors.primary,
  },
  pollProgressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#e2e8f0',
  },
  pollProgressFillSelected: {
    backgroundColor: '#dbeafe',
  },
  pollOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    zIndex: 2,
  },
  pollOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
    flex: 1,
  },
  pollOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  pollPercentText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    marginLeft: 8,
  },
  pollPercentTextSelected: {
    color: Colors.primary,
  },

  /* Agenda Card */
  agendaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  agendaTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  agendaList: {
    gap: 8,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  agendaBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  agendaBulletText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  agendaItemText: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
  },

  /* Chat Preview */
  chatPreviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  chatHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  chatSnippet: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    gap: 2,
  },
  chatAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  chatAuthorFaculty: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  chatMessage: {
    fontSize: 12.5,
    color: Colors.onSurface,
  },

  /* Bottom Bar */
  bottomActionWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#edf0f7',
  },
  enterButton: {
    borderRadius: 9999,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  enterButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  enterButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
