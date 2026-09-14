import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  getLiveClassById,
  LIVE_CLASSES_DATA,
  LiveClassSession,
} from '@/data/liveClassesData';
import {
  LiveStreamStage,
  StageLayoutMode,
  FloatingReaction,
} from '@/components/live/LiveStreamStage';
import { LiveChatTab } from '@/components/live/LiveChatTab';
import { LivePollTab } from '@/components/live/LivePollTab';
import { LiveSlidesTab } from '@/components/live/LiveSlidesTab';
import { Colors, Motion } from '@/theme';

type LiveTabType = 'chat' | 'polls' | 'slides' | 'faculty';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LiveClassroomScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const session: LiveClassSession = useMemo(() => {
    const found = getLiveClassById((id as string) || 'live-01');
    return found || LIVE_CLASSES_DATA[0];
  }, [id]);

  const [activeTab, setActiveTab] = useState<LiveTabType>('chat');
  const [layoutMode, setLayoutMode] = useState<StageLayoutMode>('presentation');
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  // Back button animation
  const backBtnScale = useSharedValue(1);
  const backBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backBtnScale.value }],
  }));

  const handleTriggerReaction = (emoji: string) => {
    const newReaction: FloatingReaction = {
      id: `rx-${Date.now()}-${Math.random()}`,
      emoji,
      xOffset: Math.floor(Math.random() * 50),
    };

    setReactions((prev) => [...prev.slice(-8), newReaction]);

    // Clear after 2.5 seconds
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2500);
  };

  const handleToggleHandRaise = () => {
    setIsHandRaised((prev) => {
      const next = !prev;
      Alert.alert(
        next ? 'Hand Raised ✋' : 'Hand Lowered',
        next
          ? 'You are now Position #2 in the direct audio queue. The faculty or moderator will unmute your microphone shortly.'
          : 'You have left the audio question queue.'
      );
      return next;
    });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* 1. STANDARDIZED 64px DOCLOCK TOP HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <AnimatedPressable
            onPress={() => router.back()}
            onPressIn={() => {
              backBtnScale.value = withSpring(0.92, Motion.tactileSpring);
            }}
            onPressOut={() => {
              backBtnScale.value = withSpring(1, Motion.tactileSpring);
            }}
            style={[styles.backBtn, backBtnAnimStyle]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back to home"
          >
            <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
          </AnimatedPressable>

          <View style={styles.headerTitleGroup}>
            <View style={styles.livePulseRow}>
              <View style={styles.redPulseDot} />
              <Text style={styles.liveText}>LIVE NOW</Text>
              <Text style={styles.dotDivider}>•</Text>
              <Text style={styles.viewerText}>{session.viewerCount}</Text>
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {session.title}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={handleToggleHandRaise}
            style={[
              styles.handRaiseBtn,
              isHandRaised && styles.handRaiseBtnActive,
            ]}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={isHandRaised ? 'Lower hand' : 'Raise hand'}
          >
            <Text style={styles.handEmoji}>✋</Text>
            <Text
              style={[
                styles.handRaiseText,
                isHandRaised && styles.handRaiseTextActive,
              ]}
            >
              {isHandRaised ? 'Queue #2' : 'Raise Hand'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 2. CINEMATIC INTERACTIVE VIDEO STAGE */}
      <LiveStreamStage
        session={session}
        layoutMode={layoutMode}
        onChangeLayout={setLayoutMode}
        reactions={reactions}
        onTriggerReaction={handleTriggerReaction}
      />

      {/* 3. WORKSPACE TABS STRIP */}
      <View style={styles.tabNavStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabNavContent}
        >
          <TabNavPill
            label="Live Chat & Q&A"
            icon="chat-bubble-outline"
            isActive={activeTab === 'chat'}
            onPress={() => setActiveTab('chat')}
          />
          <TabNavPill
            label="Live Polls"
            icon="poll"
            badge="1 Active"
            isActive={activeTab === 'polls'}
            onPress={() => setActiveTab('polls')}
          />
          <TabNavPill
            label="Slides & Pearls"
            icon="slideshow"
            isActive={activeTab === 'slides'}
            onPress={() => setActiveTab('slides')}
          />
          <TabNavPill
            label="Faculty & Info"
            icon="person-outline"
            isActive={activeTab === 'faculty'}
            onPress={() => setActiveTab('faculty')}
          />
        </ScrollView>
      </View>

      {/* 4. ACTIVE TAB WORKSPACE */}
      <View style={styles.tabContentContainer}>
        {activeTab === 'chat' && (
          <LiveChatTab onSendReaction={handleTriggerReaction} />
        )}
        {activeTab === 'polls' && (
          <LivePollTab initialPoll={session.poll} />
        )}
        {activeTab === 'slides' && (
          <LiveSlidesTab session={session} />
        )}
        {activeTab === 'faculty' && (
          <FacultyAgendaView session={session} />
        )}
      </View>
    </View>
  );
}

const TabNavPill: React.FC<{
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  badge?: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ label, icon, badge, isActive, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabPill, isActive && styles.tabPillActive]}
    >
      <MaterialIcons
        name={icon}
        size={14}
        color={isActive ? '#0059b9' : '#575f6e'}
      />
      <Text style={[styles.tabPillText, isActive && styles.tabPillTextActive]}>
        {label}
      </Text>
      {badge && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
};

const FacultyAgendaView: React.FC<{ session: LiveClassSession }> = ({
  session,
}) => {
  return (
    <ScrollView
      style={styles.facultyScroll}
      contentContainerStyle={styles.facultyContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Faculty Card */}
      <View style={styles.facultyCard}>
        <Image
          source={{ uri: session.faculty.avatar }}
          style={styles.facultyBigAvatar}
        />
        <View style={styles.facultyDetails}>
          <Text style={styles.facultyCardName}>{session.faculty.name}</Text>
          <Text style={styles.facultyCardTitle}>{session.faculty.title}</Text>
          <Text style={styles.facultyCardInst}>
            {session.faculty.institution}
          </Text>
          <View style={styles.facultyVerifiedBadge}>
            <MaterialIcons name="verified" size={13} color="#0059b9" />
            <Text style={styles.facultyVerifiedText}>
              DocLock Certified Faculty
            </Text>
          </View>
        </View>
      </View>

      {/* Session Agenda */}
      <View style={styles.agendaCard}>
        <Text style={styles.agendaHeader}>Lecture Milestone Schedule</Text>
        <View style={styles.milestoneList}>
          <MilestoneRow
            time="15:00 - 15:15"
            title="Electrophysiology & Action Potential Phases"
            status="completed"
          />
          <MilestoneRow
            time="15:15 - 15:40"
            title="Vaughan-Williams Class I-IV Pharmacodynamics"
            status="live"
          />
          <MilestoneRow
            time="15:40 - 15:55"
            title="Emergency ICU Protocols & Toxicity Management"
            status="upcoming"
          />
          <MilestoneRow
            time="15:55 - 16:10"
            title="Interactive Clinical Vignettes & Voice Q&A"
            status="upcoming"
          />
        </View>
      </View>

      {/* Recommended QBank Practice */}
      <View style={styles.qbankRecommendCard}>
        <View style={styles.qbankRecommendLeft}>
          <MaterialIcons name="quiz" size={20} color="#0059b9" />
          <View style={{ gap: 2 }}>
            <Text style={styles.qbankRecommendTitle}>
              Post-Class QBank Practice
            </Text>
            <Text style={styles.qbankRecommendSub}>
              15 High-Yield Antiarrhythmics MCQs
            </Text>
          </View>
        </View>
        <View style={styles.qbankTag}>
          <Text style={styles.qbankTagText}>85% High Yield</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const MilestoneRow: React.FC<{
  time: string;
  title: string;
  status: 'completed' | 'live' | 'upcoming';
}> = ({ time, title, status }) => {
  return (
    <View style={styles.milestoneRow}>
      <View
        style={[
          styles.milestoneDot,
          status === 'completed'
            ? styles.milestoneDotDone
            : status === 'live'
            ? styles.milestoneDotLive
            : styles.milestoneDotUp,
        ]}
      />
      <View style={styles.milestoneTexts}>
        <View style={styles.milestoneTimeRow}>
          <Text style={styles.milestoneTime}>{time}</Text>
          {status === 'live' && (
            <View style={styles.milestoneLiveBadge}>
              <Text style={styles.milestoneLiveText}>IN PROGRESS</Text>
            </View>
          )}
        </View>
        <Text style={styles.milestoneTitle}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* 1. Standardized 64px Header */
  topHeader: {
    height: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e7f2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitleGroup: {
    flex: 1,
    gap: 2,
  },
  livePulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  redPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ef4444',
    letterSpacing: 0.5,
  },
  dotDivider: {
    fontSize: 10,
    color: '#8a92a6',
  },
  viewerText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#0059b9',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#181c22',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  handRaiseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eaf0ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#d0e1fd',
  },
  handRaiseBtnActive: {
    backgroundColor: '#0059b9',
    borderColor: '#0059b9',
  },
  handEmoji: {
    fontSize: 12,
  },
  handRaiseText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0059b9',
  },
  handRaiseTextActive: {
    color: '#ffffff',
  },

  /* 3. Workspace Tabs Strip */
  tabNavStrip: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f7',
    paddingVertical: 8,
  },
  tabNavContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#f1f4fb',
  },
  tabPillActive: {
    backgroundColor: '#e3edff',
    borderWidth: 1,
    borderColor: '#0059b9',
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#575f6e',
  },
  tabPillTextActive: {
    color: '#0059b9',
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 9999,
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },

  /* 4. Tab Content Container */
  tabContentContainer: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },

  /* Faculty Tab View */
  facultyScroll: {
    flex: 1,
  },
  facultyContent: {
    padding: 14,
    gap: 14,
    paddingBottom: 24,
  },
  facultyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e7f2',
  },
  facultyBigAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#0059b9',
  },
  facultyDetails: {
    flex: 1,
    gap: 2,
  },
  facultyCardName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#181c22',
  },
  facultyCardTitle: {
    fontSize: 12,
    color: '#575f6e',
  },
  facultyCardInst: {
    fontSize: 11,
    color: '#8a92a6',
  },
  facultyVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  facultyVerifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0059b9',
  },

  /* Agenda Card */
  agendaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e7f2',
    gap: 14,
  },
  agendaHeader: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#181c22',
  },
  milestoneList: {
    gap: 12,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  milestoneDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
  },
  milestoneDotDone: {
    backgroundColor: '#10b981',
  },
  milestoneDotLive: {
    backgroundColor: '#ef4444',
  },
  milestoneDotUp: {
    backgroundColor: '#cbd5e1',
  },
  milestoneTexts: {
    flex: 1,
    gap: 2,
  },
  milestoneTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#727782',
  },
  milestoneLiveBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  milestoneLiveText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#b91c1c',
  },
  milestoneTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2d333e',
  },

  /* Recommended QBank Card */
  qbankRecommendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eef4ff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#cde0ff',
  },
  qbankRecommendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qbankRecommendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0059b9',
  },
  qbankRecommendSub: {
    fontSize: 11.5,
    color: '#575f6e',
  },
  qbankTag: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  qbankTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0059b9',
  },
});
